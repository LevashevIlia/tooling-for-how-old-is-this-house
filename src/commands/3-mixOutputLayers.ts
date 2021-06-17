import {
  autoStartCommandIfNeeded,
  Command,
  CommandError,
} from "@kachkaev/commands";
import tilebelt from "@mapbox/tilebelt";
import * as turf from "@turf/turf";
import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

import {
  addBufferToBbox,
  calculatePointDistanceToPolygonInMeters,
  deriveBboxCenter,
  isPointInBbox,
  unionBboxes,
} from "../shared/helpersForGeometry";
import { writeFormattedJson } from "../shared/helpersForJson";
import { getSourcesDirPath } from "../shared/helpersForPaths";
import {
  getOutputLayerFileName,
  OutputLayer,
  OutputLayerProperties,
} from "../shared/outputLayers";
import {
  getMixedOutputLayersFilePath,
  MixedOutputLayersFeature,
  PropertyVariant,
} from "../shared/outputMixing";
import { processFiles } from "../shared/processFiles";
import { getTerritoryDirPath, getTerritoryExtent } from "../shared/territory";
import { processTiles } from "../shared/tiles";

const bufferSizeInMeters = 7;
const tileZoom = 15;

interface BaseLayerProperties extends OutputLayerProperties {
  id: string;
}
type BaseLayerFeature = turf.Feature<
  turf.Polygon | turf.MultiPolygon,
  BaseLayerProperties
> & {
  bbox: turf.BBox;
  bboxCenter: [x: number, y: number];
  bboxWithBuffer: turf.BBox;
};

interface BaseLayer {
  features: BaseLayerFeature[];
  source: string;
  hash: string;
}

interface PatchLayerFeatureProperties extends BaseLayerProperties {
  derivedBuildArea?: number;
}

type PatchLayerFeature = turf.Feature<
  turf.Point,
  PatchLayerFeatureProperties
> & {
  bbox?: never;
};

interface PatchLayer {
  features: PatchLayerFeature[];
  source: string;
  hash: string;
}

let autogeneratedIdCount = 0;

const generateId = (): string => {
  autogeneratedIdCount += 1;

  return `autogenerated-${autogeneratedIdCount}`;
};

const buildGlobalFeatureId = (
  featureSource: string,
  featureIdProperty: string,
) => `${featureSource}|${featureIdProperty}`;

const usedIds = new Set<string>();

const ensureUniqueIdProperty = (
  properties: OutputLayerProperties,
  source: string,
  logger: Console,
): BaseLayerProperties => {
  let id = `${properties.id || generateId()}`;
  while (usedIds.has(buildGlobalFeatureId(source, id))) {
    logger.log(
      chalk.yellow(
        `Found duplicate id: ${source} → ${id}. An autogenerated id will be used to avoid incorrect mixing of property variants.`,
      ),
    );
    id = generateId();
  }

  usedIds.add(buildGlobalFeatureId(source, id));

  return { ...properties, id };
};

const generateCommentWithMixedFeatures = (count: number) =>
  `mixed features: ${count.toString().padStart(3, " ")}`;

export const mixOutputLayers: Command = async ({ logger }) => {
  logger.log(chalk.bold("Mixing output layers"));

  const baseLayers: BaseLayer[] = [];
  const patchLayers: PatchLayer[] = [];

  const relativeSourcesDirPath = path.relative(
    getTerritoryDirPath(),
    getSourcesDirPath(),
  );

  await processFiles({
    logger,
    fileSearchPattern: [
      `${relativeSourcesDirPath}/manual/*.geojson`,
      `${relativeSourcesDirPath}/*/${getOutputLayerFileName()}`,
    ],
    fileSearchDirPath: getTerritoryDirPath(),
    filesNicknameToLog: "output layers",
    processFile: async (filePath, prefixLength) => {
      const prefix = " ".repeat(prefixLength + 1);

      const source = path.basename(path.dirname(filePath));
      logger.log(`${prefix}source: ${chalk.cyan(source)}`);

      const outputLayer = (await fs.readJson(filePath)) as OutputLayer;

      const layerRole = outputLayer.layerRole;
      if (layerRole !== "base" && layerRole !== "patch") {
        logger.log(
          `${prefix}layer role: ${chalk.red(
            layerRole,
          )} (expected ‘base’ or ‘patch’, skipping)`,
        );

        return;
      }
      logger.log(`${prefix}layer role: ${chalk.cyan(layerRole)}`);

      const knownAt = outputLayer.knownAt;
      logger.log(`${prefix}known at: ${chalk.cyan(knownAt ?? "no date")}`);

      const totalFeatureCount = outputLayer.features.length;
      logger.log(`${prefix}total features: ${chalk.cyan(totalFeatureCount)}`);

      const logPickedFeatures = (geometryTypes: string, featureCount: number) =>
        logger.log(
          `${prefix}picked features (${geometryTypes}): ${chalk.cyan(
            featureCount,
          )} (${Math.round((featureCount / totalFeatureCount) * 100)}%)`,
        );

      if (layerRole === "base") {
        const features: BaseLayerFeature[] = outputLayer.features.flatMap(
          (feature): BaseLayerFeature[] => {
            const geometry = feature.geometry;
            if (
              !geometry ||
              (geometry.type !== "Polygon" && geometry.type !== "MultiPolygon")
            ) {
              return [];
            }

            const bbox = turf.bbox(feature);

            return [
              {
                bbox,
                bboxCenter: deriveBboxCenter(bbox),
                bboxWithBuffer: addBufferToBbox(bbox, bufferSizeInMeters),
                geometry,
                properties: ensureUniqueIdProperty(
                  feature.properties,
                  source,
                  logger,
                ),
                type: feature.type,
              },
            ];
          },
        );

        logPickedFeatures("polygons and multipolygons", features.length);

        baseLayers.push({
          source,
          features,
          hash: `${knownAt ?? totalFeatureCount}`,
        });
      } else {
        const features: PatchLayerFeature[] = [];
        outputLayer.features.forEach((feature) => {
          const geometry = feature.geometry;
          if (!geometry) {
            return;
          }

          features.push({
            type: "Feature",
            geometry: turf.pointOnFeature(geometry).geometry,
            properties: {
              ...ensureUniqueIdProperty(feature.properties, source, logger),
              derivedBuildArea: Math.round(turf.area(geometry)) || undefined,
            },
          });
        });

        logPickedFeatures("convertible to points", features.length);

        patchLayers.push({
          source,
          features,
          hash: `${knownAt ?? totalFeatureCount}`,
        });
      }
    },
  });

  if (!baseLayers.length) {
    throw new CommandError(
      `No base layers found. Have you called all ‘generateOutputLayer’ commands?`,
    );
  }

  const mixedFeatures: MixedOutputLayersFeature[] = [];

  const territoryExtent = await getTerritoryExtent();
  await processTiles({
    territoryExtent,
    preserveOutput: false,
    initialZoom: tileZoom,
    maxAllowedZoom: tileZoom,
    logger,
    processTile: async (tile) => {
      const tileBbox = tilebelt.tileToBBOX(tile) as turf.BBox;

      const filteredBaseLayers: BaseLayer[] = baseLayers.map((baseLayer) => ({
        ...baseLayer,
        features: baseLayer.features.filter((baseLayerFeature) =>
          isPointInBbox(baseLayerFeature.bboxCenter, tileBbox),
        ),
      }));

      const bboxWithBufferAroundBuildings = (() => {
        let result: turf.BBox | undefined = undefined;
        for (const filteredBaseLayer of filteredBaseLayers) {
          for (const baseLayerFeature of filteredBaseLayer.features) {
            if (!result) {
              result = baseLayerFeature.bboxWithBuffer;
            } else {
              result = unionBboxes(result, baseLayerFeature.bboxWithBuffer);
            }
          }
        }

        return result;
      })();

      if (!bboxWithBufferAroundBuildings) {
        return {
          cacheStatus: "used",
          tileStatus: "complete",
          comment: generateCommentWithMixedFeatures(0),
        };
      }

      const originalMixedFeatureCount = mixedFeatures.length;

      const filteredMixinLayers: PatchLayer[] = patchLayers.map(
        (mixinLayer) => ({
          ...mixinLayer,
          features: mixinLayer.features.filter((feature) =>
            isPointInBbox(
              feature.geometry.coordinates,
              bboxWithBufferAroundBuildings,
            ),
          ),
        }),
      );

      for (const filteredBaseLayer of filteredBaseLayers) {
        for (const baseLayerFeature of filteredBaseLayer.features) {
          const propertiesVariants: PropertyVariant[] = [
            {
              ...baseLayerFeature.properties,
              derivedBuildArea: Math.round(turf.area(baseLayerFeature)),
              distance: 0,
              source: filteredBaseLayer.source,
            },
          ];

          for (const filteredMixinLayer of filteredMixinLayers) {
            for (const mixinLayerFeature of filteredMixinLayer.features) {
              if (
                !isPointInBbox(
                  mixinLayerFeature.geometry.coordinates,
                  baseLayerFeature.bboxWithBuffer,
                )
              ) {
                continue;
              }

              const distance = Math.max(
                0,
                Math.round(
                  calculatePointDistanceToPolygonInMeters(
                    mixinLayerFeature.geometry,
                    baseLayerFeature,
                  ) * 100,
                ) / 100,
              );

              if (distance <= bufferSizeInMeters) {
                propertiesVariants.push({
                  ...mixinLayerFeature.properties,
                  source: filteredMixinLayer.source,
                  distance,
                });
              }
            }
          }

          const geometrySource = filteredBaseLayer.source;

          mixedFeatures.push(
            turf.feature(baseLayerFeature.geometry, {
              geometrySource,
              geometryId: baseLayerFeature.properties.id,
              variants: propertiesVariants,
            }),
          );
        }
      }

      return {
        cacheStatus: "notUsed",
        tileStatus: "complete",
        comment: generateCommentWithMixedFeatures(
          mixedFeatures.length - originalMixedFeatureCount,
        ),
      };
    },
  });

  process.stdout.write(chalk.green(`Saving...`));

  const resultFileName = getMixedOutputLayersFilePath();
  const mixedFeatureCollection = turf.featureCollection(mixedFeatures);
  await writeFormattedJson(resultFileName, mixedFeatureCollection);

  logger.log(` Result saved to ${chalk.magenta(resultFileName)}`);
};

autoStartCommandIfNeeded(mixOutputLayers, __filename);

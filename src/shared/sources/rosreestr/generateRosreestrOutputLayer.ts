import * as turf from "@turf/turf";
import fs from "fs-extra";
import _ from "lodash";

import { normalizeAddress } from "../../addresses";
import { extractYearFromCompletionDates } from "../../completionDates";
import { deepClean } from "../../deepClean";
import {
  GenerateOutputLayer,
  OutputLayer,
  OutputLayerProperties,
} from "../../output";
import { processFiles } from "../../processFiles";
import { getTerritoryExtent } from "../../territory";
import { combineRosreestrTiles } from "./combineRosreestrTiles";
import { normalizeCnForSorting } from "./helpersForCn";
import { getObjectInfoPagesDirPath } from "./helpersForPaths";
import { InfoPageData, InfoPageObject, ObjectCenterFeature } from "./types";

type OutputLayerPropertiesWithRawAddress = Omit<
  OutputLayerProperties,
  "normalizedAddress"
> & { rawAddress?: string };

const extractPropertiesFromFirResponse = (
  infoPageObject: InfoPageObject,
): OutputLayerPropertiesWithRawAddress | "notBuilding" | undefined => {
  const { cn, firResponse, firFetchedAt } = infoPageObject;
  if (typeof firResponse !== "object" || !firFetchedAt) {
    return;
  }

  if (firResponse.parcelData.oksType !== "building") {
    return "notBuilding";
  }

  const completionDates = firResponse.parcelData.oksYearBuilt;

  return {
    id: cn,
    knownAt: firFetchedAt,
    completionDates,
    rawAddress:
      firResponse.objectData.addressNote ??
      firResponse.objectData.objectAddress?.mergedAddress,
    completionYear: extractYearFromCompletionDates(completionDates),
  };
};

const extractPropertiesFromPkkResponse = (
  infoPageObject: InfoPageObject,
): OutputLayerPropertiesWithRawAddress | "notBuilding" | undefined => {
  const { cn, pkkResponse, pkkFetchedAt } = infoPageObject;
  if (typeof pkkResponse !== "object" || !pkkFetchedAt) {
    return;
  }

  if (pkkResponse.attrs.oks_type !== "building") {
    return "notBuilding";
  }

  const completionDates = pkkResponse.attrs.year_built;

  return {
    id: cn,
    knownAt: pkkFetchedAt,
    rawAddress: pkkResponse.attrs.address,
    completionDates,
    completionYear: extractYearFromCompletionDates(completionDates),
  };
};

export const generateRosreestrOutputLayer: GenerateOutputLayer = async ({
  logger,
  findPointForNormalizedAddress,
  addressNormalizationConfig,
}) => {
  const territoryExtent = await getTerritoryExtent();

  const { objectCenterFeatures } = await combineRosreestrTiles({
    logger,
    objectType: "cco",
  });

  const objectCenterFeaturesInsideTerritory = objectCenterFeatures.filter(
    ({ geometry }) => turf.booleanPointInPolygon(geometry, territoryExtent),
  );

  const objectCenterFeatureByCn: Record<string, ObjectCenterFeature> = {};
  for (const objectCenterFeature of objectCenterFeaturesInsideTerritory) {
    objectCenterFeatureByCn[
      objectCenterFeature.properties.cn
    ] = objectCenterFeature;
  }

  const originalSpellingsSet = new Set<string>();

  const cnsWithGeometrySet = new Set<string>();
  const outputFeatures: OutputLayer["features"] = [];
  await processFiles({
    logger,
    fileSearchDirPath: getObjectInfoPagesDirPath(),
    fileSearchPattern: "**/page-*.json",
    processFile: async (filePath) => {
      const infoPageData: InfoPageData = await fs.readJson(filePath);
      for (const infoPageEntry of infoPageData) {
        const outputLayerPropertiesWithRawAddress =
          extractPropertiesFromFirResponse(infoPageEntry) ??
          extractPropertiesFromPkkResponse(infoPageEntry);

        if (!outputLayerPropertiesWithRawAddress) {
          continue;
        }

        if (outputLayerPropertiesWithRawAddress === "notBuilding") {
          continue;
        }

        const {
          rawAddress,
          ...otherProperties
        } = outputLayerPropertiesWithRawAddress;
        const normalizedAddress = normalizeAddress(
          rawAddress,
          addressNormalizationConfig,
        );
        const outputLayerProperties: OutputLayerProperties = {
          ...otherProperties,
          normalizedAddress,
        };

        const cn = infoPageEntry.cn;
        let geometry: turf.Point | undefined =
          objectCenterFeatureByCn[cn]?.geometry;
        if (geometry) {
          cnsWithGeometrySet.add(cn);
        }
        if (normalizedAddress && !geometry && findPointForNormalizedAddress) {
          geometry = findPointForNormalizedAddress(normalizedAddress);
        }

        outputFeatures.push(
          turf.feature(geometry, deepClean(outputLayerProperties)),
        );
      }
    },
    statusReportFrequency: 1000,
    showFilePath: true,
  });

  const unusedCnsWithGeometry = objectCenterFeaturesInsideTerritory
    .map((f) => f.properties.cn)
    .filter((cn) => !cnsWithGeometrySet.has(cn))
    .sort();

  const unusedCnsWithGeometryInTerritory = unusedCnsWithGeometry.filter((cn) =>
    turf.booleanPointInPolygon(objectCenterFeatureByCn[cn]!, territoryExtent),
  );

  logger?.log({
    objectCenterFeatures: objectCenterFeatures.length,
    objectCenterFeaturesInsideTerritory:
      objectCenterFeaturesInsideTerritory.length,
    outputFeatures: outputFeatures.length,
    cnsWithGeometries: cnsWithGeometrySet.size,
    unusedCnsWithGeometry,
    unusedCnsWithGeometryInTerritory,
  });

  return {
    type: "FeatureCollection",
    layerRole: "patch",
    originalSpellings: [...originalSpellingsSet],
    features: _.sortBy(outputFeatures, (outputFeature) =>
      normalizeCnForSorting(outputFeature.properties.id),
    ),
  };
};

import { autoStartCommandIfNeeded, Command } from "@kachkaev/commands";
import * as turf from "@turf/turf";
import chalk from "chalk";
import fs from "fs-extra";
import _ from "lodash";

import {
  FeatureType,
  getCombinedTileFeaturesFilePath,
} from "../../../shared/sources/rosreestr";
import { getCnChunk } from "../../../shared/sources/rosreestr/helpersForCn";

const districtPartLengthInCn = "00:00:0000000".length;

export const combineTilesWithLots: Command = async ({ logger }) => {
  logger.log(chalk.bold("sources/rosreestr: Fetching CCO details"));

  process.stdout.write(chalk.green("Loading combined features..."));

  const ccoFeaturesInTiles = (await fs.readJson(
    getCombinedTileFeaturesFilePath("cco"),
  )) as turf.FeatureCollection;
  const lotFeaturesInTiles = (await fs.readJson(
    getCombinedTileFeaturesFilePath("lot"),
  )) as turf.FeatureCollection;

  logger.log(" Done.");

  process.stdout.write(chalk.green("Indexing..."));

  const featureTypeByCn: Record<string, FeatureType> = {};
  for (const [featureType, featureCollection] of [
    ["cco", ccoFeaturesInTiles],
    ["lot", lotFeaturesInTiles],
  ] as const) {
    for (const feature of featureCollection.features) {
      if (!feature.properties?.cn) {
        throw new Error(
          `Found feature ${featureType} without cn (cadastral number): ${JSON.stringify(
            feature,
          )}`,
        );
      }
      if (featureTypeByCn[feature.properties.cn]) {
        throw new Error(
          `Found feature ${featureType} with an already used cn (cadastral number): ${JSON.stringify(
            feature,
          )}`,
        );
      }
      featureTypeByCn[feature.properties.cn] = featureType;
    }
  }

  const featureTuples = Object.entries(featureTypeByCn);
  const featureTuplesByDistrict = _.groupBy(featureTuples, (featureTuple) =>
    getCnChunk(featureTuple[0], 0, 3),
  );

  const districtTuples = _.orderBy(
    Object.entries(featureTuplesByDistrict),
    (tuple) => tuple[0],
  );

  logger.log(
    ` Found ${featureTuples.length} features (${ccoFeaturesInTiles.features.length} CCOs and ${lotFeaturesInTiles.features.length} lots) in ${districtTuples.length} districts.`,
  );

  for (const [
    district,
    currentDistrictUnorderedFeatureTuples,
  ] of districtTuples
    .filter((districtTuple) => districtTuple[1].length > 100)
    .slice(0, 20)) {
    const currentDistrictFeatureTuples = _.orderBy(
      currentDistrictUnorderedFeatureTuples,
      (featureTuple) =>
        parseInt(featureTuple[0].substr(districtPartLengthInCn + 1)),
    );
    logger.log(chalk.green(`District ${district}:`));
    logger.log(
      currentDistrictFeatureTuples
        .map((t) => (t[1] === "cco" ? chalk.cyan : chalk.gray)(t[0].padEnd(20)))
        .join(""),
    );
    logger.log(``);
  }
};

autoStartCommandIfNeeded(combineTilesWithLots, __filename);
import { autoStartCommandIfNeeded, Command } from "@kachkaev/commands";
import chalk from "chalk";
import fs from "fs-extra";

import {
  ReportedGeocode,
  reportGeocodes as importedReportGeocodes,
} from "../../../shared/geocoding";
import { Point2dCoordinates } from "../../../shared/helpersForGeometry";
import { processFiles } from "../../../shared/processFiles";
import {
  getYandexGeocoderCacheDir,
  getYandexGeocoderCacheEntryFileSuffix,
  YandexGeocoderCacheEntry,
} from "../../../shared/sources/yandex";

export const reportGeocodes: Command = async ({ logger }) => {
  logger.log(chalk.bold(`sources/yandex: report geocodes`));

  const reportedGeocodes: ReportedGeocode[] = [];

  await processFiles({
    logger,
    fileSearchDirPath: getYandexGeocoderCacheDir(),
    fileSearchPattern: `**/*${getYandexGeocoderCacheEntryFileSuffix()}`,
    showFilePath: true,
    statusReportFrequency: 1000,
    processFile: async (filePath) => {
      const entry = (await fs.readJson(filePath)) as YandexGeocoderCacheEntry;

      let coordinates: Point2dCoordinates | undefined = undefined;

      const geoObject =
        entry.data?.response?.GeoObjectCollection?.featureMember?.[0]
          ?.GeoObject;
      const rawCoordinates: string | undefined = geoObject?.Point?.pos;

      const [lon, lat] =
        rawCoordinates?.split(" ").map((n) => parseFloat(n)) ?? [];

      if (lon && lat) {
        coordinates = [lon, lat];
      }

      const precision =
        geoObject?.metaDataProperty?.GeocoderMetaData?.precision;

      if (!coordinates || precision !== "exact") {
        reportedGeocodes.push({
          address: entry.normalizedAddress,
          knownAt: entry.fetchedAt,
        });
      }

      reportedGeocodes.push({
        address: entry.normalizedAddress,
        coordinates,
        knownAt: entry.fetchedAt,
      });
    },
  });

  process.stdout.write(
    chalk.green(
      `Saving ${reportedGeocodes.length} reported geocode${
        reportedGeocodes.length > 1 ? "s" : "s"
      }...`,
    ),
  );

  await importedReportGeocodes({
    reportedGeocodes,
    source: "yandex",
  });

  process.stdout.write(chalk.magenta(` Done.\n`));
};

autoStartCommandIfNeeded(reportGeocodes, __filename);
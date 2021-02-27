import { autoStartCommandIfNeeded, Command } from "@kachkaev/commands";
import { AxiosResponse } from "axios";
import chalk from "chalk";
import sleep from "sleep-promise";
import sortKeys from "sort-keys";

import { deepClean } from "../../../shared/deepClean";
import { serializeTime } from "../../../shared/helpersForJson";
import {
  compressRosreestrCenter,
  compressRosreestrExtent,
  convertCnToId,
  fetchJsonFromRosreestr,
  PkkFeatureResponse,
  PkkResponseInInfoPageResponse,
  processRosreestrPages,
} from "../../../shared/sources/rosreestr";

const processRawPkkFeatureResponse = (
  rawApiResponse: AxiosResponse<unknown>,
): PkkResponseInInfoPageResponse => {
  if (rawApiResponse.status !== 200) {
    throw new Error(`Unexpected API response status ${rawApiResponse.status}`);
  }
  const rawResponseData = rawApiResponse.data as PkkFeatureResponse;
  const feature = rawResponseData.feature;
  if (!feature) {
    return "void";
  }
  const oksType = feature.attrs.oks_type;
  if (!oksType) {
    return "notOks";
  }

  if (oksType === "flat") {
    return "flat";
  }

  return sortKeys(
    deepClean({
      ...feature,
      center: feature.center
        ? compressRosreestrCenter(feature.center)
        : undefined,
      extent: feature.extent
        ? compressRosreestrExtent(feature.extent)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      extent_parent: feature.extent_parent
        ? compressRosreestrExtent(feature.extent_parent)
        : undefined,
    }),
    { deep: true },
  );
};

export const fetchObjectInfosFromPkkApi: Command = async ({ logger }) => {
  logger.log(
    chalk.bold(
      "sources/rosreestr: Fetching object infos from FIR API (https://pkk.rosreestr.ru/api/features/...)",
    ),
  );

  await processRosreestrPages({
    concurrencyDisabledReason:
      "PKK API returns 403 for a few hours after receiving more than ≈50 requests per minute.",
    logger,
    findAnchorObjects: (infoPageObjects) =>
      infoPageObjects.filter(
        (infoPageObject) =>
          infoPageObject.creationReason !== "gap" ||
          typeof infoPageObject.pkkResponse === "object" ||
          typeof infoPageObject.firResponse === "object",
      ),
    includeObjectsAroundAnchors: 5,
    includeObjectsAroundEnds: 5,
    processObject: async (infoPageObject) => {
      if (
        infoPageObject.creationReason === "lotInTile" ||
        infoPageObject.firResponse !== "void" ||
        infoPageObject.pkkResponse
      ) {
        return infoPageObject;
      }

      const featureId = convertCnToId(infoPageObject.cn);

      const pkkResponse = processRawPkkFeatureResponse(
        await fetchJsonFromRosreestr(
          `https://pkk.rosreestr.ru/api/features/5/${featureId}`,
        ),
      );

      await sleep(500); // Protection against 403

      return {
        ...infoPageObject,
        pkkFetchedAt: serializeTime(),
        pkkResponse,
      };
    },
  });
};

autoStartCommandIfNeeded(fetchObjectInfosFromPkkApi, __filename);

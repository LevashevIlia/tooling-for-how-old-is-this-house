import path from "path";

import { splitAddress } from "../addresses";
import { getRegionDirPath } from "../region";

export const getGeocodeDictionariesDirPath = () => {
  return path.resolve(getRegionDirPath(), "geocoding");
};

export const getGeocodeDictionaryFileName = () => "dictionary.json";

export const getDictionaryFilePath = (sliceId: string) => {
  return path.resolve(
    getGeocodeDictionariesDirPath(),
    sliceId,
    getGeocodeDictionaryFileName(),
  );
};

export const deriveNormalizedAddressSliceId = (
  normalizedAddress: string,
): string => {
  return splitAddress(normalizedAddress).slice(0, 3).join("/");
};
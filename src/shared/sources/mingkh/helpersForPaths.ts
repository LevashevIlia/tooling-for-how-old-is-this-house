import path from "path";

import { getSourceDirPath } from "../../getSourceDirPath";

export const getMingkhDirPath = () => {
  return getSourceDirPath("mingkh");
};

export const getHouseListFilePath = (
  mingkhRegionUrl: string,
  mingkhCityUrl: string,
) => {
  return path.resolve(
    getMingkhDirPath(),
    "house-lists",
    `${mingkhRegionUrl}--${mingkhCityUrl}.json`,
  );
};

export const getHouseFilePath = (houseId: number, fileNameSuffix: string) => {
  const normalisedHouseId = `${houseId}`.padStart(7, "0");

  return path.resolve(
    getMingkhDirPath(),
    "houses",
    `${normalisedHouseId.substring(0, 4)}xxx`,
    `${normalisedHouseId}--${fileNameSuffix}`,
  );
};
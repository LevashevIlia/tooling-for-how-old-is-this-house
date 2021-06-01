import { prioritizeRelevantPropertyVariants } from "./prioritizeRelevantPropertyVariants";
import { PickFromPropertyVariants } from "./types";

export const pickFloorCount: PickFromPropertyVariants<
  "floorCountAboveGround" | "floorCountBelowGround" | "floorCountSource"
> = ({ listRelevantPropertyVariants, logger, targetBuildArea }) => {
  const propertyVariants = prioritizeRelevantPropertyVariants({
    listRelevantPropertyVariants,
    logger,
    prioritizedSources: ["manual", "rosreestr", "mingkh", "osm"],
    propertyNamesThatShouldNotBeOmitted: ["floorCount"],
    targetBuildArea,
  });

  for (const propertyVariant of propertyVariants) {
    if (propertyVariant.floorCountAboveGround) {
      return {
        floorCountAboveGround: propertyVariant.floorCountAboveGround,
        floorCountBelowGround: propertyVariant.floorCountBelowGround,
        floorCountSource: propertyVariant.source,
      };
    }
  }

  return undefined;
};

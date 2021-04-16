import * as React from "react";

import { MixedPropertyVariantsFeatureCollection } from "../../shared/output";
import {
  OsmFeatureCollection,
  OsmRoadGeometry,
  OsmWaterObjectGeometry,
} from "../../shared/sources/osm/types";
import { TerritoryExtent } from "../../shared/territory";
import { Figure } from "../shared/figure";

export interface FigureWithHouseAgesProps {
  buildingCollection: MixedPropertyVariantsFeatureCollection;
  roadCollection: OsmFeatureCollection<OsmRoadGeometry>;
  territoryExtent: TerritoryExtent;
  waterObjectCollection: OsmFeatureCollection<OsmWaterObjectGeometry>;
}

export const FigureWithHouseAges: React.VoidFunctionComponent<FigureWithHouseAgesProps> = ({
  buildingCollection,
  roadCollection,
  territoryExtent,
  waterObjectCollection,
}) => {
  return (
    <Figure width={1000} height={1000}>
      buildings: {buildingCollection.features.length}
      <br />
      territory extent: {territoryExtent.geometry.coordinates.length}
      <br />
      roads: {roadCollection.features.length}
      <br />
      water objects: {waterObjectCollection.features.length}
    </Figure>
  );
};
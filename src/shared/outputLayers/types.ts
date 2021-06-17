import * as turf from "@turf/turf";

import { GeocodeAddressResult } from "../geocoding";

export type OutputLayerRole = "base" | "patch";

export interface OutputLayerProperties {
  address?: string;
  buildingType?: string;
  completionDates?: string;
  /** Only relevant to layers in "manual" sourc. @see README.md */
  dataToOmit?: string;
  derivedCompletionYear?: number;
  /** Number of square meters occupied by the building, as per docs (not geometry) */
  documentedBuildArea?: number;
  /** Present if coordinates are coming from another source via geocoding */
  externalGeometrySource?: string;
  floorCountAboveGround?: number;
  floorCountBelowGround?: number;
  id?: string;
  knownAt: string;
  name?: string;
  photoAuthorName?: string;
  photoAuthorUrl?: string;
  photoUrl?: string;
  url?: string;
  wikipediaUrl?: string;
}

export type OutputLayerGeometry = turf.Polygon | turf.MultiPolygon | turf.Point;

export type OutputLayerFeatureWithGeometry = turf.Feature<
  OutputLayerGeometry,
  OutputLayerProperties
>;
export type OutputLayerFeatureWithoutGeometry = turf.Feature<
  null,
  OutputLayerProperties
>;
export type OutputLayerFeature =
  | OutputLayerFeatureWithGeometry
  | OutputLayerFeatureWithoutGeometry;

export type OutputLayer = turf.FeatureCollection<
  OutputLayerGeometry | null,
  OutputLayerProperties
> & {
  knownAt?: string;
  layerRole: OutputLayerRole;
};

export type ConfiguredGeocodeAddress = (
  address: string,
) => GeocodeAddressResult;

export type GenerateOutputLayer = (payload: {
  logger?: Console;
  geocodeAddress?: ConfiguredGeocodeAddress;
}) => Promise<OutputLayer>;

export type OutputGeometry = turf.Polygon | turf.MultiPolygon;

import { BBox, GeoJsonProperties } from "geojson";

// Report types
export type ReportType = "issue" | "idea" | "civilian-event" | "government-event";

export type Report = {
  id: string;
  description: string;
  location: {
    city?: string;
    state?: string;
    address?: string;
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: string;
  votes?: number;
  downvotes?: number;
  title?: string;
  images?: { mimeType: string; base64: string; }[];
};

export type ReportWithType = Report & {
  type: ReportType;
};

// Category counts for pie chart visualization
export type CategoryCounts = {
  issue: number;
  idea: number;
  "civilian-event": number;
  "government-event": number;
};

// Cluster properties
export interface ClusterProperties {
  cluster: true;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string;
  categoryCounts: CategoryCounts;
}

// Individual point properties
export interface PointProperties {
  cluster: false;
  report: ReportWithType;
  categoryCounts?: CategoryCounts;
}

// GeoJSON Point Feature for clusters
export interface ClusterFeature {
  type: "Feature";
  id: number;
  properties: ClusterProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

// GeoJSON Point Feature for individual points
export interface PointFeature {
  type: "Feature";
  id: string;
  properties: PointProperties;
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

// Union type for all possible features
export type ClusterOrPointFeature = ClusterFeature | PointFeature;

// Supercluster options
export interface SuperclusterOptions {
  radius?: number;
  maxZoom?: number;
  minZoom?: number;
  minPoints?: number;
  extent?: number;
  nodeSize?: number;
  log?: boolean;
  generateId?: boolean;
  reduce?: (accumulated: ClusterProperties, props: GeoJsonProperties) => void;
  map?: (props: GeoJsonProperties) => GeoJsonProperties;
}

// Category filter configuration
export type CategoryFilterState = Record<ReportType, boolean>;

export interface CategoryConfig {
  type: ReportType;
  label: string;
  color: string;
  emoji: string;
}

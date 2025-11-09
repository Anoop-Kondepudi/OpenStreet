import {
  ReportWithType,
  ReportType,
  CategoryCounts,
  PointFeature,
  ClusterProperties,
} from "@/types/cluster";
import { GeoJsonProperties } from "geojson";

// Category colors matching the current design
export const CATEGORY_COLORS: Record<ReportType, string> = {
  issue: "#ef4444", // red-500
  idea: "#3b82f6", // blue-500
  "Community-event": "#10b981", // green-500
  "government-event": "#8b5cf6", // purple-500
};

// Convert reports array to GeoJSON point features for Supercluster
export function reportsToGeoJSON(reports: ReportWithType[]): PointFeature[] {
  return reports.map((report) => ({
    type: "Feature",
    id: report.id,
    properties: {
      cluster: false,
      report,
    },
    geometry: {
      type: "Point",
      coordinates: [report.location.lng, report.location.lat],
    },
  }));
}

// Calculate cluster size based on point count (30px - 60px range)
export function getClusterSize(pointCount: number): number {
  if (pointCount < 10) return 30;
  if (pointCount < 25) return 40;
  if (pointCount < 50) return 50;
  return 60;
}

// Calculate pie chart segments from category counts
export interface PieSegment {
  color: string;
  percentage: number;
  count: number;
  type: ReportType;
  startAngle: number;
  endAngle: number;
}

export function calculatePieSegments(
  categoryCounts: CategoryCounts
): PieSegment[] {
  const total = Object.values(categoryCounts).reduce((sum, count) => sum + count, 0);

  if (total === 0) return [];

  const segments: PieSegment[] = [];
  let currentAngle = 0;

  // Process in a consistent order
  const types: ReportType[] = ["issue", "idea", "Community-event", "government-event"];

  types.forEach((type) => {
    const count = categoryCounts[type];
    if (count > 0) {
      const percentage = count / total;
      const angleSpan = percentage * 360;

      segments.push({
        color: CATEGORY_COLORS[type],
        percentage,
        count,
        type,
        startAngle: currentAngle,
        endAngle: currentAngle + angleSpan,
      });

      currentAngle += angleSpan;
    }
  });

  return segments;
}

// Create SVG path for a pie slice
export function createPieSlicePath(
  centerX: number,
  centerY: number,
  radius: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(centerX, centerY, radius, endAngle);
  const end = polarToCartesian(centerX, centerY, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    centerX,
    centerY,
    "L",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
    "Z",
  ].join(" ");
}

// Convert polar coordinates to cartesian
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

// Initialize category counts
export function initializeCategoryCounts(): CategoryCounts {
  return {
    issue: 0,
    idea: 0,
    "Community-event": 0,
    "government-event": 0,
  };
}

// Reduce function for Supercluster to aggregate category counts
export function reduceClusterProperties(
  accumulated: ClusterProperties,
  props: GeoJsonProperties
): void {
  if (!props) return;

  if (!accumulated.categoryCounts) {
    accumulated.categoryCounts = initializeCategoryCounts();
  }

  // If this is a cluster, merge its category counts
  if (props.cluster) {
    const clusterCounts = props.categoryCounts as CategoryCounts;
    Object.keys(clusterCounts).forEach((key) => {
      const type = key as ReportType;
      accumulated.categoryCounts[type] += clusterCounts[type];
    });
  } else {
    // This is an individual point, increment its category
    const report = props.report as ReportWithType;
    accumulated.categoryCounts[report.type]++;
  }
}

// Format point count for display (e.g., 100+ instead of 123)
export function formatPointCount(count: number): string {
  if (count >= 1000) return "999+";
  if (count >= 100) return "100+";
  if (count >= 50) return "50+";
  return count.toString();
}

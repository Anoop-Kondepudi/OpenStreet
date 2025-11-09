import React from "react";
import {
  calculatePieSegments,
  createPieSlicePath,
  getClusterSize,
  formatPointCount,
} from "@/lib/cluster-utils";
import { CategoryCounts } from "@/types/cluster";

interface ClusterMarkerProps {
  pointCount: number;
  categoryCounts: CategoryCounts;
  onClick: () => void;
}

export const ClusterMarker: React.FC<ClusterMarkerProps> = ({
  pointCount,
  categoryCounts,
  onClick,
}) => {
  const size = getClusterSize(pointCount);
  const radius = size / 2;
  const innerRadius = radius - 3; // Leave space for border
  const segments = calculatePieSegments(categoryCounts);

  // If only one category, render a simple circle instead of pie chart
  const singleCategory = segments.length === 1;

  return (
    <div
      className="cursor-pointer hover:scale-110 transition-transform"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{
          filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))",
        }}
      >
        {/* White border circle */}
        <circle
          cx={radius}
          cy={radius}
          r={radius}
          fill="white"
        />

        {singleCategory ? (
          // Single color circle
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill={segments[0].color}
          />
        ) : (
          // Pie chart with multiple segments
          <>
            {segments.map((segment, index) => (
              <path
                key={index}
                d={createPieSlicePath(
                  radius,
                  radius,
                  innerRadius,
                  segment.startAngle,
                  segment.endAngle
                )}
                fill={segment.color}
              />
            ))}
          </>
        )}

        {/* Count label in center */}
        <text
          x={radius}
          y={radius}
          textAnchor="middle"
          dominantBaseline="central"
          fill="white"
          fontSize={size > 40 ? "14" : "11"}
          fontWeight="bold"
          style={{
            textShadow: "0 1px 2px rgba(0,0,0,0.8)",
            userSelect: "none",
          }}
        >
          {formatPointCount(pointCount)}
        </text>
      </svg>
    </div>
  );
};

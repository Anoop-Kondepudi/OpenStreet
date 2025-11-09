"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CategoryConfig, CategoryFilterState, ReportType } from "@/types/cluster";

interface MapFilterLegendProps {
  filters: CategoryFilterState;
  onFilterChange: (category: ReportType, enabled: boolean) => void;
  categoryCounts?: Record<ReportType, number>;
  className?: string;
}

// Category configuration with colors matching the map markers
export const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    type: "issue",
    label: "Issues",
    color: "#ef4444", // Red
    emoji: "🔴",
  },
  {
    type: "idea",
    label: "Ideas",
    color: "#3b82f6", // Blue
    emoji: "💡",
  },
  {
    type: "Community-event",
    label: "Community Events",
    color: "#10b981", // Green
    emoji: "👥",
  },
  {
    type: "government-event",
    label: "Government Events",
    color: "#8b5cf6", // Purple
    emoji: "🏛️",
  },
];

export function MapFilterLegend({
  filters,
  onFilterChange,
  categoryCounts,
  className = "",
}: MapFilterLegendProps) {
  const allEnabled = Object.values(filters).every((v) => v);
  const allDisabled = Object.values(filters).every((v) => !v);

  const handleToggleAll = () => {
    const newState = !allEnabled;
    CATEGORY_CONFIGS.forEach((config) => {
      onFilterChange(config.type, newState);
    });
  };

  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">Map Filters</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleAll}
            className="h-7 text-xs"
          >
            {allEnabled ? "Clear All" : "Show All"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {CATEGORY_CONFIGS.map((config) => {
          const count = categoryCounts?.[config.type] ?? 0;
          const isEnabled = filters[config.type];

          return (
            <div
              key={config.type}
              className="flex items-center space-x-3 group"
            >
              <Checkbox
                id={`filter-${config.type}`}
                checked={isEnabled}
                onCheckedChange={(checked) =>
                  onFilterChange(config.type, checked === true)
                }
                className="border-2"
              />
              <Label
                htmlFor={`filter-${config.type}`}
                className="flex items-center flex-1 cursor-pointer select-none"
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm mr-2 transition-opacity group-hover:scale-110"
                  style={{
                    backgroundColor: config.color,
                    opacity: isEnabled ? 1 : 0.3,
                  }}
                />
                <span className={`text-sm font-medium ${!isEnabled && "opacity-50"}`}>
                  {config.label}
                </span>
                {categoryCounts && (
                  <span
                    className={`ml-auto text-xs font-mono px-2 py-0.5 rounded-full ${
                      isEnabled
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground opacity-50"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </Label>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

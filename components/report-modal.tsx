"use client";

import { X, MapPin, Calendar, AlertCircle, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";

type Report = {
  id: string;
  type?: string;
  description: string;
  location: {
    city: string;
    state: string;
    address: string;
    lat: number;
    lng: number;
  };
  timestamp: string;
  status: string;
};

interface ReportModalProps {
  report: Report | null;
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  markerPosition?: { x: number; y: number } | null;
}

export function ReportModal({ report, isOpen, isClosing = false, onClose, markerPosition }: ReportModalProps) {
  if (!isOpen || !report) return null;

  const isCrime = report.type === "crime";
  const reportColor = isCrime ? "bg-red-500" : "bg-orange-500";
  const reportIcon = isCrime ? AlertCircle : Construction;
  const ReportIcon = reportIcon;

  // Calculate smart positioning
  const calculatePosition = () => {
    if (!markerPosition) {
      // Fallback to center positioning
      return {
        position: "center" as const,
        style: {},
        tailPosition: "bottom" as const,
      };
    }

    const { x, y } = markerPosition;
    const modalWidth = 512; // max-w-lg = 512px
    const modalHeight = 600; // approximate height
    const spacing = 20; // spacing between modal and marker
    const markerSize = 20; // marker diameter

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Determine vertical position (prefer above)
    const spaceAbove = y - spacing - markerSize / 2;
    const spaceBelow = viewportHeight - y - spacing - markerSize / 2;
    const showAbove = spaceAbove >= modalHeight || spaceAbove > spaceBelow;

    // Calculate vertical position
    let top: number;
    let tailPosition: "top" | "bottom";

    if (showAbove) {
      top = y - spacing - markerSize / 2;
      tailPosition = "bottom";
    } else {
      top = y + spacing + markerSize / 2;
      tailPosition = "top";
    }

    // Calculate horizontal position (keep centered on marker, but adjust if near edges)
    let left = x;
    const halfWidth = modalWidth / 2;
    const padding = 16; // p-4 = 16px

    // Adjust if too close to left edge
    if (left - halfWidth < padding) {
      left = halfWidth + padding;
    }
    // Adjust if too close to right edge
    if (left + halfWidth > viewportWidth - padding) {
      left = viewportWidth - halfWidth - padding;
    }

    // Calculate tail offset (how far from center to position the tail)
    const tailOffset = x - left;

    return {
      position: "absolute" as const,
      style: {
        left: `${left}px`,
        top: showAbove ? `${top}px` : undefined,
        bottom: showAbove ? undefined : `${viewportHeight - top}px`,
        transform: showAbove ? "translate(-50%, -100%)" : "translate(-50%, 0)",
        maxWidth: "512px",
        width: "calc(100vw - 32px)",
      },
      tailPosition,
      tailOffset,
    };
  };

  const positionConfig = calculatePosition();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 ${
          isClosing ? 'animate-fade-scale-out' : 'animate-in fade-in duration-200'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`fixed z-50 pointer-events-none ${
          positionConfig.position === "center"
            ? "inset-0 flex items-center justify-center p-4"
            : ""
        }`}
      >
        <div
          className={`bg-card border rounded-lg shadow-lg pointer-events-auto relative ${
            isClosing ? 'animate-fade-scale-out' : 'animate-fade-scale'
          }`}
          style={positionConfig.position === "absolute" ? positionConfig.style : { maxWidth: "512px", width: "100%" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Rounded Tail Indicator */}
          {positionConfig.position === "absolute" && (
            <div
              className={`absolute ${
                positionConfig.tailPosition === "bottom"
                  ? "-bottom-3 rounded-bl-full"
                  : "-top-3 rounded-tl-full"
              } bg-card border-l border-b w-6 h-6`}
              style={{
                left: `calc(50% + ${positionConfig.tailOffset || 0}px - 12px)`,
                clipPath: positionConfig.tailPosition === "bottom"
                  ? "polygon(0 0, 100% 0, 0 100%)"
                  : "polygon(0 100%, 100% 100%, 0 0)",
                transform: positionConfig.tailPosition === "bottom"
                  ? "rotate(-45deg)"
                  : "rotate(135deg)",
              }}
            />
          )}
          {/* Header */}
          <div className={`${reportColor} text-white p-6 rounded-t-lg relative`}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <ReportIcon className="h-8 w-8" />
              <div>
                <h2 className="text-2xl font-bold">
                  {isCrime ? "Crime Report" : "Construction Report"}
                </h2>
                <p className="text-white/90 text-sm mt-1">Report ID: {report.id}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-foreground">{report.description}</p>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </h3>
              <p className="text-foreground">{report.location.address}</p>
              <p className="text-sm text-muted-foreground">
                {report.location.city}, {report.location.state}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {report.location.lat.toFixed(4)}, {report.location.lng.toFixed(4)}
              </p>
            </div>

            {/* Timestamp */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Reported
              </h3>
              <p className="text-foreground">
                {new Date(report.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Status */}
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-2">
                Status
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                {report.status}
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </>
  );
}

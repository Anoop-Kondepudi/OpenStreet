"use client";

import { useState, useRef, useCallback } from "react";
import Map, { Marker, NavigationControl, ScaleControl, GeolocateControl, MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import crimeData from "@/docs/crime.json";
import constructionData from "@/docs/construction.json";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const MAPBOX_TOKEN = "pk.eyJ1IjoiemVsZG9tIiwiYSI6ImNtaHF2czcyeDEyaGcya3B6d3ZvY2hleDkifQ.2BQHylALQUj9cNYDuHijOQ";

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

interface MapboxMapProps {
  onReportSelect: (report: Report, markerPosition?: { x: number; y: number }) => void;
  showPopup?: boolean;
}

export function MapboxMap({ onReportSelect, showPopup = false }: MapboxMapProps) {
  const [viewState, setViewState] = useState({
    longitude: -96.80,
    latitude: 32.78,
    zoom: 11
  });

  const [popupInfo, setPopupInfo] = useState<Report | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [isPopupClosing, setIsPopupClosing] = useState(false);
  const mapRef = useRef<MapRef>(null);

  const getMarkerScreenPosition = useCallback((lat: number, lng: number): { x: number; y: number } | undefined => {
    if (!mapRef.current) return undefined;

    try {
      const map = mapRef.current.getMap();
      const point = map.project([lng, lat]);

      // Get the map container's position on the page
      const mapContainer = mapRef.current.getContainer();
      const rect = mapContainer.getBoundingClientRect();

      return {
        x: rect.left + point.x,
        y: rect.top + point.y,
      };
    } catch (error) {
      console.error("Error calculating marker position:", error);
      return undefined;
    }
  }, []);

  const handleMarkerClick = (report: Report) => {
    const markerPosition = getMarkerScreenPosition(report.location.lat, report.location.lng);

    if (showPopup) {
      // Toggle: if clicking same marker, close it; otherwise show new one
      if (popupInfo?.id === report.id) {
        setPopupInfo(null);
        setPopupPosition(null);
      } else {
        setPopupInfo(report);
        setPopupPosition(markerPosition || null);
      }
    } else {
      onReportSelect(report, markerPosition);
    }
  };

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-border shadow-lg">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Crime Markers - Red */}
        {crimeData.reports.map((report: Report) => {
          const reportWithType = { ...report, type: "crime" };
          return (
            <Marker
              key={report.id}
              longitude={report.location.lng}
              latitude={report.location.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(reportWithType);
              }}
            >
              <div
                className="cursor-pointer hover:scale-110 transition-transform"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#ef4444",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </Marker>
          );
        })}

        {/* Construction Markers - Orange */}
        {constructionData.reports.map((report: Report) => {
          const reportWithType = { ...report, type: "construction" };
          return (
            <Marker
              key={report.id}
              longitude={report.location.lng}
              latitude={report.location.lat}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                handleMarkerClick(reportWithType);
              }}
            >
              <div
                className="cursor-pointer hover:scale-110 transition-transform"
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: "#f97316",
                  border: "2px solid #ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              />
            </Marker>
          );
        })}

        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <ScaleControl />
      </Map>

      {/* Custom Styled Popup with Animation */}
      {showPopup && popupInfo && popupPosition && (() => {
        // Calculate smart positioning for popup preview
        const popupWidth = 240; // min-w-[200px] + padding
        const popupHeight = 120; // approximate height
        const spacing = 15;
        const markerSize = 20;

        const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;

        // Determine vertical position (prefer above)
        const spaceAbove = popupPosition.y - spacing - markerSize / 2;
        const spaceBelow = viewportHeight - popupPosition.y - spacing - markerSize / 2;
        const showAbove = spaceAbove >= popupHeight || spaceAbove > spaceBelow;

        let top: number;
        let tailPosition: 'top' | 'bottom';

        if (showAbove) {
          top = popupPosition.y - spacing - markerSize / 2;
          tailPosition = 'bottom';
        } else {
          top = popupPosition.y + spacing + markerSize / 2;
          tailPosition = 'top';
        }

        // Calculate horizontal position
        let left = popupPosition.x;
        const halfWidth = popupWidth / 2;
        const padding = 16;

        if (left - halfWidth < padding) {
          left = halfWidth + padding;
        }
        if (left + halfWidth > viewportWidth - padding) {
          left = viewportWidth - halfWidth - padding;
        }

        const tailOffset = popupPosition.x - left;

        return (
          <div
            className="fixed z-10 animate-fade-scale-fast pointer-events-none"
            style={{
              left: `${left}px`,
              top: showAbove ? `${top}px` : undefined,
              bottom: showAbove ? undefined : `${viewportHeight - top}px`,
              transform: showAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
            }}
          >
            <Card className="shadow-lg border-border min-w-[200px] pointer-events-auto relative">
              {/* Rounded Tail for popup */}
              <div
                className={`absolute ${
                  tailPosition === 'bottom'
                    ? '-bottom-2 rounded-bl-full'
                    : '-top-2 rounded-tl-full'
                } bg-card border-l border-b w-4 h-4`}
                style={{
                  left: `calc(50% + ${tailOffset}px - 8px)`,
                  clipPath: tailPosition === 'bottom'
                    ? 'polygon(0 0, 100% 0, 0 100%)'
                    : 'polygon(0 100%, 100% 100%, 0 0)',
                  transform: tailPosition === 'bottom'
                    ? 'rotate(-45deg)'
                    : 'rotate(135deg)',
                }}
              />
              <CardContent className="p-4 relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-6 w-6"
                  onClick={() => {
                    setPopupInfo(null);
                    setPopupPosition(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="pr-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    {popupInfo.type === "crime" ? "Crime Report" : "Construction Report"}
                  </p>
                  <Button
                    onClick={() => {
                      const markerPosition = getMarkerScreenPosition(popupInfo.location.lat, popupInfo.location.lng);
                      onReportSelect(popupInfo, markerPosition);
                      setPopupInfo(null);
                      setPopupPosition(null);
                    }}
                    className="w-full"
                  >
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}

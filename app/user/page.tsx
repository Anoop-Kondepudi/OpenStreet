"use client";

import { useState } from "react";
import { MapboxMap } from "@/components/mapbox-map";
import { ReportModal } from "@/components/report-modal";
import { MapClickPopup } from "@/components/map-click-popup";
import { CreateReportModal } from "@/components/create-report-modal";

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

export default function UserPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);

  // Create report state
  const [showMapClickPopup, setShowMapClickPopup] = useState(false);
  const [isMapClickPopupClosing, setIsMapClickPopupClosing] = useState(false);
  const [mapClickLocation, setMapClickLocation] = useState<{ lat: number; lng: number; x: number; y: number } | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreateModalClosing, setIsCreateModalClosing] = useState(false);
  const [canClosePopup, setCanClosePopup] = useState(false);

  const handleReportSelect = (report: Report, position?: { x: number; y: number }) => {
    // Close any open create popups first
    if (showMapClickPopup) {
      closeMapClickPopup();
    }

    setSelectedReport(report);
    setMarkerPosition(position || null);
    setIsModalOpen(true);
    setIsModalClosing(false);
  };

  const handleCloseModal = () => {
    setIsModalClosing(true);
    // Small delay before clearing to allow exit animation
    setTimeout(() => {
      setIsModalOpen(false);
      setSelectedReport(null);
      setMarkerPosition(null);
      setIsModalClosing(false);
    }, 300);
  };

  const handleMapClick = (location: { lat: number; lng: number; x: number; y: number }) => {
    console.log("🗺️ Map clicked!", { location, isModalOpen, showCreateModal, showMapClickPopup });

    // Don't show if a modal is already open
    if (isModalOpen || showCreateModal) {
      console.log("❌ Blocked: Modal already open");
      return;
    }

    console.log("✅ Setting popup state...");
    setMapClickLocation(location);
    setShowMapClickPopup(true);
    setIsMapClickPopupClosing(false);
    setCanClosePopup(false);

    // Allow closing after a short delay to prevent immediate close from same click
    setTimeout(() => {
      console.log("🔓 Popup can now be closed");
      setCanClosePopup(true);
    }, 100);
  };

  const closeMapClickPopup = () => {
    if (!canClosePopup) {
      console.log("⏳ Close blocked - too soon after opening");
      return;
    }

    console.log("🚪 Closing popup...");
    setIsMapClickPopupClosing(true);
    setTimeout(() => {
      setShowMapClickPopup(false);
      setMapClickLocation(null);
      setIsMapClickPopupClosing(false);
      setCanClosePopup(false);
    }, 200);
  };

  const handleCreateReport = () => {
    // Force close the popup immediately
    console.log("📝 Create Report clicked - closing popup");
    setCanClosePopup(true); // Override delay
    setIsMapClickPopupClosing(true);
    setTimeout(() => {
      setShowMapClickPopup(false);
      // DON'T clear mapClickLocation here - we need it for the modal!
      setIsMapClickPopupClosing(false);
    }, 200);

    // Small delay to allow popup to close before opening modal
    setTimeout(() => {
      console.log("🎬 Opening CreateReportModal with location:", mapClickLocation);
      setShowCreateModal(true);
      setIsCreateModalClosing(false);
    }, 200);
  };

  const handleCloseCreateModal = () => {
    setIsCreateModalClosing(true);
    setTimeout(() => {
      setShowCreateModal(false);
      setMapClickLocation(null);
      setIsCreateModalClosing(false);
    }, 300);
  };

  const handleSubmitReport = (report: {
    type: "crime" | "construction";
    description: string;
    location: {
      address: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
    };
  }) => {
    // TODO: Implement saving to JSON file
    console.log("New report:", report);

    // For now, just close the modal and show success
    handleCloseCreateModal();

    // TODO: Refresh map data to show new marker
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Civic Link</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View community reports in your area
          </p>
        </div>
      </header>

      {/* Map - Full screen below header */}
      <main className="flex-1 p-4">
        <div className="h-full w-full">
          <MapboxMap
            onReportSelect={handleReportSelect}
            showPopup={true}
            onMapClick={handleMapClick}
          />
        </div>
      </main>

      {/* Map Click Popup */}
      {(() => {
        console.log("🎨 Render check:", { showMapClickPopup, mapClickLocation });
        return showMapClickPopup && mapClickLocation ? (
          <MapClickPopup
            position={{ x: mapClickLocation.x, y: mapClickLocation.y }}
            onCreateReport={handleCreateReport}
            onClose={closeMapClickPopup}
            isClosing={isMapClickPopupClosing}
          />
        ) : null;
      })()}

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        isClosing={isCreateModalClosing}
        onClose={handleCloseCreateModal}
        location={mapClickLocation ? { lat: mapClickLocation.lat, lng: mapClickLocation.lng } : null}
        onSubmit={handleSubmitReport}
      />

      {/* Report Modal */}
      <ReportModal
        report={selectedReport}
        isOpen={isModalOpen}
        isClosing={isModalClosing}
        onClose={handleCloseModal}
        markerPosition={markerPosition}
      />
    </div>
  );
}

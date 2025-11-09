"use client";

import { useState } from "react";
import { MapboxMap } from "@/components/mapbox-map";
import { ReportModal } from "@/components/report-modal";

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
  const [markerPosition, setMarkerPosition] = useState<{ x: number; y: number } | null>(null);

  const handleReportSelect = (report: Report, position?: { x: number; y: number }) => {
    setSelectedReport(report);
    setMarkerPosition(position || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Small delay before clearing to allow exit animation
    setTimeout(() => {
      setSelectedReport(null);
      setMarkerPosition(null);
    }, 300);
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
          <MapboxMap onReportSelect={handleReportSelect} showPopup={true} />
        </div>
      </main>

      {/* Report Modal */}
      <ReportModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        markerPosition={markerPosition}
      />
    </div>
  );
}

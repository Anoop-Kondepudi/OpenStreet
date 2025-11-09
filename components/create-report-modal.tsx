"use client";

import { useState, useEffect } from "react";
import { X, ShieldAlert, Construction, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface CreateReportModalProps {
  isOpen: boolean;
  isClosing?: boolean;
  onClose: () => void;
  location: { lat: number; lng: number } | null;
  onSubmit: (report: {
    type: "crime" | "construction";
    description: string;
    location: {
      address: string;
      city: string;
      state: string;
      lat: number;
      lng: number;
    };
  }) => void;
}

export function CreateReportModal({ isOpen, isClosing = false, onClose, location, onSubmit }: CreateReportModalProps) {
  const [reportType, setReportType] = useState<"crime" | "construction">("crime");
  const [description, setDescription] = useState("");

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setReportType("crime");
      setDescription("");
    }
  }, [isOpen]);

  const handleSubmit = () => {
    if (!description.trim() || !location) return;

    console.log("📤 Submitting report:", {
      type: reportType,
      description: description.trim(),
      location: {
        address: "",
        city: "",
        state: "",
        lat: location.lat,
        lng: location.lng,
      },
    });

    onSubmit({
      type: reportType,
      description: description.trim(),
      location: {
        address: "", // Empty - to be filled manually in JSON
        city: "",    // Empty - to be filled manually in JSON
        state: "",   // Empty - to be filled manually in JSON
        lat: location.lat,
        lng: location.lng,
      },
    });
  };

  if (!isOpen || !location) {
    console.log("❌ CreateReportModal not rendering:", { isOpen, location });
    return null;
  }

  console.log("✅ CreateReportModal rendering!", { isOpen, location });

  const isCrime = reportType === "crime";
  const accentColor = isCrime ? "text-red-500" : "text-orange-500";
  const bgColor = isCrime ? "bg-red-500/10" : "bg-orange-500/10";
  const borderColor = isCrime ? "border-red-500/20" : "border-orange-500/20";
  const ReportIcon = isCrime ? ShieldAlert : Construction;

  const canSubmit = description.trim().length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className={`bg-card border rounded-lg shadow-lg pointer-events-auto relative max-w-lg w-full ${
            isClosing ? 'animate-fade-scale-out' : 'animate-fade-scale'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 hover:bg-muted"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-16 h-16 ${bgColor} ${borderColor} border-2 rounded-xl transition-colors`}>
                <ReportIcon className={`h-8 w-8 ${accentColor} transition-colors`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  Create New Report
                </h2>
                <p className="text-sm text-muted-foreground">Fill out the details below</p>
              </div>
            </div>

            {/* Report Type */}
            <div>
              <Label className="text-sm font-semibold text-foreground/80 mb-3 block">
                Report Type
              </Label>
              <RadioGroup value={reportType} onValueChange={(value) => setReportType(value as "crime" | "construction")}>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="crime" id="crime" />
                    <Label htmlFor="crime" className="cursor-pointer flex items-center gap-2 text-sm">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      Crime Report
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 flex-1">
                    <RadioGroupItem value="construction" id="construction" />
                    <Label htmlFor="construction" className="cursor-pointer flex items-center gap-2 text-sm">
                      <Construction className="h-4 w-4 text-orange-500" />
                      Construction
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-semibold text-foreground/80 mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <Label className="text-sm font-semibold text-foreground/80 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </Label>
              <div className="bg-muted/50 border border-border rounded-lg p-4">
                <p className="text-sm font-medium text-foreground">
                  Latitude: {location.lat.toFixed(6)}
                </p>
                <p className="text-sm font-medium text-foreground mt-1">
                  Longitude: {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t p-4 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              Submit Report
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

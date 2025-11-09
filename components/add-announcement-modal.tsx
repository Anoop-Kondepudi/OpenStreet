"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import issueData from "@/docs/issue.json";
import ideaData from "@/docs/idea.json";
import CommunityEventData from "@/docs/Community-event.json";
import governmentEventData from "@/docs/government-event.json";

interface AddAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Report = {
  id: string;
  title?: string;
  description: string;
  type?: string;
};

export function AddAnnouncementModal({ isOpen, onClose, onSuccess }: AddAnnouncementModalProps) {
  const [title, setTitle] = useState("");
  const [reportType, setReportType] = useState<"issue" | "idea" | "event">("issue");
  const [relatedReportId, setRelatedReportId] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [availableReports, setAvailableReports] = useState<Report[]>([]);

  // Load available reports when report type changes
  useEffect(() => {
    let reports: Report[] = [];
    
    switch (reportType) {
      case "issue":
        reports = issueData.reports.map(r => ({ ...r, type: "issue" }));
        break;
      case "idea":
        reports = ideaData.reports.map(r => ({ ...r, type: "idea" }));
        break;
      case "event":
        reports = [...CommunityEventData.reports, ...governmentEventData.reports].map(r => ({ ...r, type: "event" }));
        break;
    }
    
    setAvailableReports(reports);
    setRelatedReportId(""); // Reset selection when type changes
  }, [reportType]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/pdf") {
        setPdfFile(file);
        setError("");
      } else {
        setError("Please select a PDF file");
        setPdfFile(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !pdfFile) {
      setError("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("reportType", reportType);
      formData.append("relatedReportId", relatedReportId);
      formData.append("pdfFile", pdfFile);

      const response = await fetch("/api/announcements", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        // Reset form
        setTitle("");
        setReportType("issue");
        setRelatedReportId("");
        setPdfFile(null);
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to create announcement");
      }
    } catch (error) {
      console.error("Error creating announcement:", error);
      setError("Failed to create announcement. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Create Government Announcement</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSubmitting}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Announcement Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Road Repair Project Update"
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Related Report Type <span className="text-red-500">*</span>
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value as "issue" | "idea" | "event")}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                <option value="issue">Issue</option>
                <option value="idea">Idea</option>
                <option value="event">Event</option>
              </select>
            </div>

            {/* Related Report Dropdown (Optional) */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Related Report (Optional)
              </label>
              <select
                value={relatedReportId}
                onChange={(e) => setRelatedReportId(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isSubmitting}
              >
                <option value="">-- Select a report --</option>
                {availableReports.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.id} - {report.title || report.description.substring(0, 50)}
                    {report.description.length > 50 ? "..." : ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Link this announcement to a specific {reportType} report ({availableReports.length} available)
              </p>
            </div>

            {/* PDF Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Upload Government Report (PDF) <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-border rounded-md p-6 text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isSubmitting}
                />
                <label
                  htmlFor="pdf-upload"
                  className="cursor-pointer flex flex-col items-center space-y-2"
                >
                  {pdfFile ? (
                    <>
                      <FileText className="h-12 w-12 text-green-500" />
                      <p className="text-sm font-medium">{pdfFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload PDF</p>
                      <p className="text-xs text-muted-foreground">
                        The document will be automatically summarized using AI
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-md p-4">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                📝 The uploaded PDF will be automatically summarized using AI. Only the summary will be visible to users, but they can download the full report.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-md p-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !pdfFile || !title}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating & Summarizing...
                  </>
                ) : (
                  "Create Announcement"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

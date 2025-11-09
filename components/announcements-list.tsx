"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Download, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Announcement = {
  id: string;
  title: string;
  summary: string;
  reportType: string;
  relatedReportId: string | null;
  pdfFileName: string;
  pdfUrl: string;
  createdAt: string;
  status: string;
};

export function AnnouncementsList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch("/api/announcements");
      const data = await response.json();
      setAnnouncements(data.announcements || []);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "issue":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "idea":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "event":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Government Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading announcements...</p>
        </CardContent>
      </Card>
    );
  }

  if (announcements.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Government Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No announcements available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Government Announcements
            <Badge variant="secondary">{announcements.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => setSelectedAnnouncement(announcement)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getTypeColor(announcement.reportType)}>
                        {announcement.reportType.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(announcement.createdAt)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mb-2">
                      {announcement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {announcement.summary}
                    </p>
                  </div>
                  <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <CardHeader className="border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(selectedAnnouncement.reportType)}>
                      {selectedAnnouncement.reportType.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(selectedAnnouncement.createdAt)}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">
                    {selectedAnnouncement.title}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedAnnouncement(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Summary */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Executive Summary</h3>
                  <div className="bg-accent/50 rounded-lg p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedAnnouncement.summary}
                    </p>
                  </div>
                </div>

                {/* Download Full Report */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">Full Report</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Download the complete government report document for detailed information.
                  </p>
                  <a
                    href={selectedAnnouncement.pdfUrl}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download Full Report (PDF)
                    </Button>
                  </a>
                </div>

                {/* Related Report Info */}
                {selectedAnnouncement.relatedReportId && (
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-lg mb-3">Related Report</h3>
                    <p className="text-sm text-muted-foreground">
                      This announcement is related to report: {" "}
                      <code className="bg-accent px-2 py-1 rounded">
                        {selectedAnnouncement.relatedReportId}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

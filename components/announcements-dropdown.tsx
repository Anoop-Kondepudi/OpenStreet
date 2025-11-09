// components/announcements-dropdown.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Bell, Download, X, FileText, Loader2 } from "lucide-react";

export type Announcement = {
    id: string;
    title: string;
    description?: string;
    summary?: string;
    reportType?: string;
    pdfUrl?: string;
    pdfFileName?: string;
    relatedReportId?: string | null;
    createdAt?: string;
    location?: {
        lat: number;
        lng: number;
    };
    startTime?: string;
    endTime?: string;
};

interface Props {
    announcements?: Announcement[];
    onToggle?: (show: boolean) => void;
}

export function AnnouncementsDropdown({ announcements: propAnnouncements, onToggle }: Props) {
    const [open, setOpen] = useState(false);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    const handleToggle = () => {
        setOpen(!open);
        if (onToggle) {
            onToggle(!open);
        }
    };

    const getTypeColor = (type?: string) => {
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

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <>
            <div className="relative">
                <Button onClick={handleToggle} className="gap-2">
                    <Bell className="h-4 w-4" />
                    Announcements
                    {announcements.length > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {announcements.length}
                        </Badge>
                    )}
                </Button>

                {open && (
                    <Card className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-y-auto z-50 shadow-lg">
                        <CardHeader className="border-b pb-3">
                            <CardTitle className="text-lg flex items-center justify-between">
                                <span>Government Announcements</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setOpen(false)}
                                    className="h-6 w-6"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                </div>
                            ) : announcements.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">
                                    No announcements available
                                </p>
                            ) : (
                                announcements.map((ann, idx) => (
                                    <div key={ann.id}>
                                        <div 
                                            className="py-3 cursor-pointer hover:bg-accent/50 rounded-lg px-2 transition-colors"
                                            onClick={() => setSelectedAnnouncement(ann)}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <Badge className={getTypeColor(ann.reportType)}>
                                                    {ann.reportType?.toUpperCase() || "ANNOUNCEMENT"}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(ann.createdAt || ann.startTime)}
                                                </span>
                                            </div>
                                            <h4 className="font-semibold text-sm mb-1">{ann.title}</h4>
                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                {ann.summary || ann.description}
                                            </p>
                                            {ann.pdfUrl && (
                                                <div className="flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-400">
                                                    <FileText className="h-3 w-3" />
                                                    <span>Full report available</span>
                                                </div>
                                            )}
                                        </div>
                                        {idx < announcements.length - 1 && <Separator className="my-1" />}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Announcement Detail Modal */}
            {selectedAnnouncement && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
                        <CardHeader className="border-b">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge className={getTypeColor(selectedAnnouncement.reportType)}>
                                            {selectedAnnouncement.reportType?.toUpperCase() || "ANNOUNCEMENT"}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(selectedAnnouncement.createdAt || selectedAnnouncement.startTime)}
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
                                    <h3 className="font-semibold text-lg mb-3">
                                        {selectedAnnouncement.summary ? "Executive Summary" : "Description"}
                                    </h3>
                                    <div className="bg-accent/50 rounded-lg p-4">
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                            {selectedAnnouncement.summary || selectedAnnouncement.description}
                                        </p>
                                    </div>
                                </div>

                                {/* Download Full Report */}
                                {selectedAnnouncement.pdfUrl && (
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
                                )}

                                {/* Related Report Info */}
                                {selectedAnnouncement.relatedReportId && (
                                    <div className="border-t pt-6">
                                        <h3 className="font-semibold text-lg mb-3">Related Report</h3>
                                        <p className="text-sm text-muted-foreground">
                                            This announcement is related to report:{" "}
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

"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface MapClickPopupProps {
  position: { x: number; y: number };
  onCreateReport: () => void;
  onClose: () => void;
  isClosing?: boolean;
}

export function MapClickPopup({ position, onCreateReport, onClose, isClosing = false }: MapClickPopupProps) {
  // Calculate smart positioning for popup
  const popupWidth = 200;
  const popupHeight = 80;
  const spacing = 15;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000;

  // Determine vertical position (prefer above)
  const spaceAbove = position.y - spacing;
  const spaceBelow = viewportHeight - position.y - spacing;
  const showAbove = spaceAbove >= popupHeight || spaceAbove > spaceBelow;

  let top: number;
  let tailPosition: 'top' | 'bottom';

  if (showAbove) {
    top = position.y - spacing;
    tailPosition = 'bottom';
  } else {
    top = position.y + spacing;
    tailPosition = 'top';
  }

  // Calculate horizontal position
  let left = position.x;
  const halfWidth = popupWidth / 2;
  const padding = 16;

  if (left - halfWidth < padding) {
    left = halfWidth + padding;
  }
  if (left + halfWidth > viewportWidth - padding) {
    left = viewportWidth - halfWidth - padding;
  }

  const tailOffset = position.x - left;

  return (
    <div
      className={`fixed z-10 pointer-events-none ${
        isClosing ? 'animate-fade-scale-out-fast' : 'animate-fade-scale-fast'
      }`}
      style={{
        left: `${left}px`,
        top: showAbove ? `${top}px` : undefined,
        bottom: showAbove ? undefined : `${viewportHeight - top}px`,
        transform: showAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
      }}
    >
      <Card
        className="shadow-lg border-border min-w-[200px] pointer-events-auto relative"
        onClick={(e) => e.stopPropagation()}
      >
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
        <CardContent className="p-3 relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={onClose}
          >
            <X className="h-3 w-3" />
          </Button>
          <div className="pr-6">
            <Button
              onClick={onCreateReport}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

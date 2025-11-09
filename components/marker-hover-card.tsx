"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

interface MarkerHoverCardProps {
  title: string;
  votes: number;
  reportType: string;
  onLike: () => void;
  onDislike: () => void;
  onClose: () => void;
  position: { x: number; y: number };
  userVote?: 'like' | 'dislike' | null;
}

export function MarkerHoverCard({
  title,
  votes,
  reportType,
  onLike,
  onDislike,
  onClose,
  position,
  userVote,
}: MarkerHoverCardProps) {
  return (
    <div
      className="fixed z-50 flex gap-2"
      style={{
        left: `${position.x}px`,
        top: `${position.y - 40}px`,
        transform: "translate(-50%, 0)",
      }}
    >
      {/* Like Button - Green Circle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLike();
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
          userVote === 'like' 
            ? 'bg-green-600 ring-2 ring-green-400 ring-offset-2' 
            : 'bg-green-500 hover:bg-green-600'
        }`}
        title="Same issue"
      >
        <ThumbsUp className={`h-5 w-5 ${userVote === 'like' ? 'fill-white' : ''} text-white`} />
      </button>

      {/* Dislike Button - Red Circle */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDislike();
        }}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
          userVote === 'dislike' 
            ? 'bg-red-600 ring-2 ring-red-400 ring-offset-2' 
            : 'bg-red-500 hover:bg-red-600'
        }`}
        title="Different issue"
      >
        <ThumbsDown className={`h-5 w-5 ${userVote === 'dislike' ? 'fill-white' : ''} text-white`} />
      </button>
    </div>
  );
}

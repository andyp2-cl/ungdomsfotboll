
import React from "react";
import { Card } from "@/components/ui/card";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export function YouTubeEmbed({ url, title, className = "" }: YouTubeEmbedProps) {
  // Extrahera YouTube video ID från URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const videoId = getYouTubeVideoId(url);

  if (!videoId) {
    return (
      <Card className={`p-4 ${className}`}>
        <p className="text-muted-foreground">Ogiltig YouTube URL</p>
      </Card>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={title || "YouTube video"}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
}

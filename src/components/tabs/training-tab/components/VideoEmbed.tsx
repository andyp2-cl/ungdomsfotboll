
import React from "react";
import { Card } from "@/components/ui/card";
import { VideoType } from "@/types/training";

interface VideoEmbedProps {
  url: string;
  videoType: VideoType;
  title?: string;
  className?: string;
}

export function VideoEmbed({ url, videoType, title, className = "" }: VideoEmbedProps) {
  // Automatisk detektering av videotyp om inte specificerad
  const detectVideoType = (url: string): VideoType => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
    if (url.includes('instagram.com')) return 'instagram';
    if (url.includes('tiktok.com')) return 'tiktok';
    if (url.includes('vimeo.com')) return 'vimeo';
    if (url.includes('facebook.com')) return 'facebook';
    return 'generic';
  };

  const actualVideoType = videoType || detectVideoType(url);

  const getEmbedUrl = (url: string, type: VideoType): string | null => {
    switch (type) {
      case 'youtube':
        const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
        const youtubeMatch = url.match(youtubeRegex);
        return youtubeMatch ? `https://www.youtube.com/embed/${youtubeMatch[1]}` : null;
      
      case 'vimeo':
        const vimeoRegex = /vimeo\.com\/(\d+)/;
        const vimeoMatch = url.match(vimeoRegex);
        return vimeoMatch ? `https://player.vimeo.com/video/${vimeoMatch[1]}` : null;
      
      case 'instagram':
        // Instagram använder ett annat format för embeds
        return url.replace('/p/', '/embed/p/').replace('/reel/', '/embed/reel/');
      
      case 'tiktok':
        // TikTok embeds kräver speciell hantering
        return url.replace('/video/', '/embed/v2/');
      
      case 'facebook':
        // Facebook video embeds
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}`;
      
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl(url, actualVideoType);

  if (!embedUrl) {
    return (
      <Card className={`p-4 ${className}`}>
        <p className="text-muted-foreground">Ogiltig video URL för {actualVideoType}</p>
      </Card>
    );
  }

  const renderEmbed = () => {
    const commonProps = {
      title: title || "Video",
      className: "absolute top-0 left-0 w-full h-full rounded-lg",
      frameBorder: "0",
      allowFullScreen: true
    };

    switch (actualVideoType) {
      case 'youtube':
      case 'vimeo':
        return (
          <iframe
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            {...commonProps}
          />
        );
      
      case 'instagram':
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
          />
        );
      
      case 'tiktok':
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
          />
        );
      
      case 'facebook':
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
          />
        );
      
      default:
        return (
          <iframe
            src={embedUrl}
            {...commonProps}
          />
        );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
        {renderEmbed()}
      </div>
      {actualVideoType !== 'youtube' && (
        <p className="text-xs text-muted-foreground mt-2 capitalize">
          {actualVideoType} video
        </p>
      )}
    </div>
  );
}

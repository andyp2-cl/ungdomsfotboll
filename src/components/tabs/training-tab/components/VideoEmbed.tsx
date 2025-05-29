
import React from "react";
import { Card } from "@/components/ui/card";
import { VideoType } from "@/types/training";
import { ExternalLink, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    console.log('Processing video URL:', url, 'Type:', type);
    
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
        // Instagram embeds fungerar ofta inte p.g.a. CORS-policy
        return null;
      
      case 'tiktok':
        // TikTok embeds kräver speciell hantering
        const tiktokRegex = /tiktok\.com\/.*\/video\/(\d+)/;
        const tiktokMatch = url.match(tiktokRegex);
        return tiktokMatch ? `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}` : null;
      
      case 'facebook':
        // Facebook video embeds
        return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&width=500&show_text=false&height=280&appId`;
      
      default:
        return url;
    }
  };

  const embedUrl = getEmbedUrl(url, actualVideoType);

  // Specialhantering för Instagram och andra problematiska plattformar
  if (actualVideoType === 'instagram' || !embedUrl) {
    return (
      <Card className={`p-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <div>
              <p className="text-sm font-medium">
                {actualVideoType === 'instagram' 
                  ? 'Instagram-video' 
                  : 'Extern video'}
              </p>
              <p className="text-xs text-muted-foreground">
                {actualVideoType === 'instagram' 
                  ? 'Instagram tillåter inte inbäddning. Klicka för att öppna i ny flik.' 
                  : 'Kan inte bäddas in. Öppna extern länk.'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(url, '_blank')}
            className="flex items-center gap-1"
          >
            <ExternalLink className="h-3 w-3" />
            Öppna
          </Button>
        </div>
      </Card>
    );
  }

  const renderEmbed = () => {
    const commonProps = {
      title: title || "Video",
      className: "absolute top-0 left-0 w-full h-full rounded-lg",
      frameBorder: "0",
      allowFullScreen: true,
      loading: "lazy" as const
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

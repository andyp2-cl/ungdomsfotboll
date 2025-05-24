
import React from "react";
import { Activity } from "@/types/player";
import { FileText, Youtube, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MatchReportSummaryProps {
  activity: Activity;
}

export function MatchReportSummary({ activity }: MatchReportSummaryProps) {
  const hasMatchReport = activity.matchReport && activity.matchReport.trim().length > 0;
  const hasYoutubeLink = activity.youtubeLink && activity.youtubeLink.trim().length > 0;
  
  if (!hasMatchReport && !hasYoutubeLink) {
    return null;
  }
  
  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activity.youtubeLink) {
      window.open(activity.youtubeLink, '_blank', 'noopener,noreferrer');
    }
  };
  
  return (
    <div className="mt-2 p-2 bg-muted/30 rounded-md text-xs">
      <div className="flex items-center gap-2 mb-1">
        {hasMatchReport && (
          <Badge variant="secondary" className="h-5 text-xs">
            <FileText className="h-3 w-3 mr-1" />
            Referat
          </Badge>
        )}
        {hasYoutubeLink && (
          <Badge 
            variant="secondary" 
            className="h-5 text-xs cursor-pointer hover:bg-secondary/80"
            onClick={handleVideoClick}
          >
            <Youtube className="h-3 w-3 mr-1" />
            Video
            <ExternalLink className="h-2 w-2 ml-1" />
          </Badge>
        )}
      </div>
      {hasMatchReport && (
        <div className="text-muted-foreground line-clamp-2">
          {activity.matchReport.substring(0, 100)}
          {activity.matchReport.length > 100 && "..."}
        </div>
      )}
    </div>
  );
}

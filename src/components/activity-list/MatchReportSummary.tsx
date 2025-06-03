
import React from "react";
import { Activity } from "@/types/player";
import { FileText, Youtube, ExternalLink, MessageSquare } from "lucide-react";
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
    <div className="mt-3 p-3 bg-gradient-to-r from-muted/20 to-muted/10 rounded-lg border border-muted/50">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Matchrapport</span>
        <div className="flex gap-1">
          {hasMatchReport && (
            <Badge variant="secondary" className="h-5 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              Referat
            </Badge>
          )}
          {hasYoutubeLink && (
            <Badge 
              variant="secondary" 
              className="h-5 text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={handleVideoClick}
            >
              <Youtube className="h-3 w-3 mr-1" />
              Video
              <ExternalLink className="h-2 w-2 ml-1" />
            </Badge>
          )}
        </div>
      </div>
      {hasMatchReport && (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {activity.matchReport.length > 150 
            ? `${activity.matchReport.substring(0, 150)}...` 
            : activity.matchReport
          }
        </div>
      )}
    </div>
  );
}

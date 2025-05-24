
import React from "react";
import { Activity } from "@/types/player";
import { FileText, Youtube } from "lucide-react";
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
          <Badge variant="secondary" className="h-5 text-xs">
            <Youtube className="h-3 w-3 mr-1" />
            Video
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


import React from "react";
import { Activity } from "@/types/player";
import { FileText, Youtube } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MatchReportSummaryProps {
  activity: Activity;
  className?: string;
}

export function MatchReportSummary({ activity, className }: MatchReportSummaryProps) {
  if (!activity.matchReport && !activity.youtubeLink) return null;
  
  // Helper function to determine if this is a valid YouTube link
  const isValidYoutubeLink = (link: string) => {
    return link && (
      link.includes("youtube.com") || 
      link.includes("youtu.be")
    );
  };

  return (
    <div className={cn("flex flex-col text-sm p-3 rounded-md bg-muted/20 mt-2", className)}>
      <div className="flex items-center space-x-2">
        {activity.matchReport && (
          <Badge variant="outline" className="gap-1">
            <FileText className="h-3 w-3" />
            <span>Referat</span>
          </Badge>
        )}
        
        {activity.youtubeLink && isValidYoutubeLink(activity.youtubeLink) && (
          <Badge variant="outline" className="gap-1">
            <Youtube className="h-3 w-3 text-red-600" />
            <a 
              href={activity.youtubeLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Video
            </a>
          </Badge>
        )}
      </div>
      
      {activity.matchReport && (
        <div className="mt-2 line-clamp-2 text-muted-foreground">
          {activity.matchReport}
        </div>
      )}
    </div>
  );
}


import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface CupMatchBadgeProps {
  activity: Activity;
  isMobile?: boolean;
}

export function CupMatchBadge({ activity, isMobile = false }: CupMatchBadgeProps) {
  if (activity.type === "cup") {
    return (
      <Badge variant="secondary" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-sm'}`}>
        <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        Cup
      </Badge>
    );
  }

  if (activity.cupId) {
    return (
      <Badge variant="outline" className={`${isMobile ? 'text-xs px-1.5 py-0.5' : 'text-sm'}`}>
        <Trophy className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
        {isMobile ? 'Cup' : 'Cup-match'}
      </Badge>
    );
  }

  return null;
}

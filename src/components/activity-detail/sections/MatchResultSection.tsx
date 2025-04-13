
import React from "react";
import { Activity } from "@/types/player";
import { MatchResultQuickView } from "../MatchResultQuickView";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function MatchResultSection({ activity, onMatchResultUpdate }: MatchResultSectionProps) {
  const isMobile = useIsMobile();
  
  if (activity.type !== "match") {
    return null;
  }

  const handleQuickResultSave = async (homeScore?: number, awayScore?: number) => {
    console.log("QuickMatchResult save called with:", {homeScore, awayScore, activityId: activity.id});
    if (onMatchResultUpdate) {
      try {
        await onMatchResultUpdate(activity.id, homeScore, awayScore);
      } catch (error) {
        console.error("Error in handleQuickResultSave:", error);
      }
    }
  };

  return (
    <div className={`border rounded-md ${isMobile ? 'p-3' : 'p-4'}`}>
      <h3 className={`font-semibold ${isMobile ? 'text-base mb-2' : 'text-lg mb-3'}`}>Matchresultat</h3>
      <MatchResultQuickView 
        activity={activity}
        onSave={handleQuickResultSave}
        isReadOnly={false}
      />
    </div>
  );
}

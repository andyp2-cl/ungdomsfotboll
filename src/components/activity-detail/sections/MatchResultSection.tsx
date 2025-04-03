
import React from "react";
import { Activity } from "@/types/player";
import { MatchResultQuickView } from "../MatchResultQuickView";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate?: (activityId: string, homeScore?: number, awayScore?: number) => Promise<void>;
}

export function MatchResultSection({ activity, onMatchResultUpdate }: MatchResultSectionProps) {
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
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      <MatchResultQuickView 
        activity={activity}
        onSave={handleQuickResultSave}
        isReadOnly={false}
      />
    </div>
  );
}

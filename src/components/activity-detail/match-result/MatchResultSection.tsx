
import React from "react";
import { Activity } from "@/types/player";
import { SimpleResultView } from "./SimpleResultView";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function MatchResultSection({ activity, onMatchResultUpdate }: MatchResultSectionProps) {
  console.log("MatchResultSection rendering for activity:", activity.id, activity.name);
  
  // Use the SimpleResultView component
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Matchresultat</h3>
      <SimpleResultView 
        activity={activity}
        onMatchResultUpdate={onMatchResultUpdate}
      />
    </div>
  );
}

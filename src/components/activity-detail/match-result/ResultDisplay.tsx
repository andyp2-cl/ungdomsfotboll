import React from "react";
import { Activity } from "@/types/player";
import { getOutcomeText, getOutcomeColorClass } from "./utils/result-display"; 

interface ResultDisplayProps {
  activity: Activity;
}

export function ResultDisplay({ activity }: ResultDisplayProps) {
  // Ensure we have valid scores
  if (activity.homeScore === undefined || activity.awayScore === undefined) {
    return <p>Matchresultat saknas</p>;
  }
  
  // Determine if it's a draw
  const isDraw = activity.homeScore === activity.awayScore;
  
  // Determine if it's a home match
  const isHome = activity.name?.toLowerCase().startsWith("hässleholms if") || activity.name?.toLowerCase().startsWith("hässleholms");
  
  // Get the outcome text and color class
  const outcomeText = getOutcomeText(activity.homeScore, activity.awayScore, isHome);
  const outcomeColorClass = getOutcomeColorClass(activity.homeScore, activity.awayScore, isHome);

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-lg font-semibold">
          {activity.homeScore} - {activity.awayScore}
        </p>
      </div>
      <div className={`rounded-full px-3 py-1 text-sm font-medium ${outcomeColorClass}`}>
        {isDraw ? "Oavgjort" : outcomeText}
      </div>
    </div>
  );
}


import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isHomeMatch, getOutcomeText, getOutcomeColorClass } from "./utils";

interface ResultDisplayProps {
  activity: Activity;
}

export function ResultDisplay({ activity }: ResultDisplayProps) {
  const homeScore = activity.homeScore;
  const awayScore = activity.awayScore;
  const hasResult = homeScore !== undefined && awayScore !== undefined;
  
  if (!hasResult) {
    return (
      <div className="text-center py-4">
        <span className="text-muted-foreground">Inget resultat registrerat</span>
      </div>
    );
  }

  const isHome = isHomeMatch(activity);
  
  // Debug the stored win status
  console.log("Displaying result with stored win status:", {
    activityId: activity.id,
    isWin: activity.isWin,
    homeScore,
    awayScore,
    isHome,
    isDraw: homeScore === awayScore
  });
  
  // Determine outcome text and badge color
  let outcomeText: string;
  let outcomeColorClass: string;
  
  // Check for draw first - important to check this before checking isWin
  if (homeScore === awayScore) {
    outcomeText = "Oavgjort";
    outcomeColorClass = "bg-gray-100 text-gray-800";
  }
  // Check explicit isWin value
  else if (typeof activity.isWin === 'boolean') {
    outcomeText = activity.isWin ? "Vinst" : "Förlust";
    outcomeColorClass = activity.isWin 
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  } 
  // Calculate based on scores as fallback
  else {
    outcomeText = getOutcomeText(homeScore, awayScore, isHome);
    outcomeColorClass = getOutcomeColorClass(homeScore, awayScore, isHome);
  }
  
  // Determine text color for score display
  const scoreTextColorClass = 
    outcomeText === "Vinst" ? "text-green-600" :
    outcomeText === "Förlust" ? "text-red-600" :
    "text-gray-600"; // Draw
  
  // Determine team labels
  const ourTeamLabel = "Våra mål";
  const theirTeamLabel = "Deras mål";
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-medium">Resultat:</span>
          <span className={`text-lg font-bold ${scoreTextColorClass}`}>{homeScore}-{awayScore}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${outcomeColorClass}`}>
          {outcomeText}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="border rounded p-3 text-center">
          <div className="text-sm text-muted-foreground mb-1">{isHome ? ourTeamLabel : theirTeamLabel}</div>
          <div className={`text-xl font-bold ${isHome ? scoreTextColorClass : ""}`}>{homeScore}</div>
        </div>
        <div className="border rounded p-3 text-center">
          <div className="text-sm text-muted-foreground mb-1">{isHome ? theirTeamLabel : ourTeamLabel}</div>
          <div className={`text-xl font-bold ${!isHome ? scoreTextColorClass : ""}`}>{awayScore}</div>
        </div>
      </div>
    </div>
  );
}

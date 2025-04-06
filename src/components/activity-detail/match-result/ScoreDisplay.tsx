
import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isHomeMatch, getOutcomeText, getOutcomeColorClass, extractTeamNames } from "./utils";

interface ScoreDisplayProps {
  activity: Activity;
  homeScore?: number;
  awayScore?: number;
}

export function ScoreDisplay({ activity, homeScore, awayScore }: ScoreDisplayProps) {
  const isHome = isHomeMatch(activity);
  const hasResult = homeScore !== undefined && awayScore !== undefined;
  const teamNames = extractTeamNames(activity);
  
  // Determine if Hässleholms IF is home or away
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Get appropriate team labels
  const homeTeamLabel = isHome ? "Hässleholms IF" : teamNames.homeTeam;
  const awayTeamLabel = !isHome ? "Hässleholms IF" : teamNames.awayTeam;
  
  if (!hasResult) {
    return (
      <div className="text-center py-4">
        <span className="text-muted-foreground">Inget resultat registrerat</span>
      </div>
    );
  }

  // Determine outcome text and color based on stored isWin or calculate it
  let outcomeText: string;
  let outcomeColorClass: string;
  
  // Also determine text color for score display
  let scoreTextColorClass: string;
  
  if (typeof activity.isWin === 'boolean') {
    // Use the stored isWin value directly
    if (activity.isWin === true) {
      outcomeText = "Vinst";
      outcomeColorClass = "bg-green-100 text-green-800";
      scoreTextColorClass = "text-green-600";
    } else if (activity.isWin === false) {
      outcomeText = "Förlust";
      outcomeColorClass = "bg-red-100 text-red-800";
      scoreTextColorClass = "text-red-600";
    } else {
      // This shouldn't happen since we're checking for boolean, but TypeScript needs it
      outcomeText = "Oavgjort";
      outcomeColorClass = "bg-gray-100 text-gray-800";
      scoreTextColorClass = "text-gray-600";
    }
  } else if (homeScore === awayScore) {
    // Handle draw case
    outcomeText = "Oavgjort";
    outcomeColorClass = "bg-gray-100 text-gray-800";
    scoreTextColorClass = "text-gray-600";
  } else {
    // Calculate based on scores as fallback
    outcomeText = getOutcomeText(homeScore, awayScore, isHome);
    outcomeColorClass = getOutcomeColorClass(homeScore, awayScore, isHome);
    
    // Determine score text color based on outcome
    if (outcomeText === "Vinst") {
      scoreTextColorClass = "text-green-600";
    } else if (outcomeText === "Förlust") {
      scoreTextColorClass = "text-red-600";
    } else {
      scoreTextColorClass = "text-gray-600";
    }
  }

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
        <div className={`border rounded p-3 text-center ${isHassleholm === 'home' ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{homeTeamLabel}</div>
          <div className={`text-xl font-bold ${isHassleholm === 'home' ? scoreTextColorClass : ''}`}>{homeScore}</div>
          {isHassleholm === 'home' && (
            <div className="mt-1 text-xs text-blue-600">Hemmalag</div>
          )}
        </div>
        <div className={`border rounded p-3 text-center ${isHassleholm === 'away' ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{awayTeamLabel}</div>
          <div className={`text-xl font-bold ${isHassleholm === 'away' ? scoreTextColorClass : ''}`}>{awayScore}</div>
          {isHassleholm === 'away' && (
            <div className="mt-1 text-xs text-blue-600">Bortalag</div>
          )}
        </div>
      </div>
    </div>
  );
}

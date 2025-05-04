
import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isHomeMatch, extractTeamNames } from "./utils";
import { getOutcomeText } from "./utils/result-display";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreDisplayProps {
  activity: Activity;
  homeScore?: number;
  awayScore?: number;
}

export function ScoreDisplay({ activity, homeScore, awayScore }: ScoreDisplayProps) {
  const isHome = isHomeMatch(activity);
  const hasResult = homeScore !== undefined && awayScore !== undefined;
  const teamNames = extractTeamNames(activity);
  const isMobile = useIsMobile();
  
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
  
  // Handle draw case first
  if (homeScore === awayScore) {
    outcomeText = "Oavgjort";
    outcomeColorClass = "bg-gray-100 text-gray-800";
    scoreTextColorClass = "text-black";
  } 
  // Then check explicit isWin property
  else if (typeof activity.isWin === 'boolean') {
    if (activity.isWin === true) {
      outcomeText = "Vinst";
      outcomeColorClass = "bg-green-100 text-green-800";
      scoreTextColorClass = "text-green-600";
    } else {
      outcomeText = "Förlust";
      outcomeColorClass = "bg-red-100 text-red-800";
      scoreTextColorClass = "text-red-600";
    }
  } 
  // Fallback to calculating based on scores
  else {
    outcomeText = getOutcomeText(homeScore, awayScore, isHome);
    
    // Determine score text color based on outcome
    if (outcomeText === "Vinst") {
      scoreTextColorClass = "text-green-600";
      outcomeColorClass = "bg-green-100 text-green-800";
    } else if (outcomeText === "Förlust") {
      scoreTextColorClass = "text-red-600";
      outcomeColorClass = "bg-red-100 text-red-800";
    } else {
      scoreTextColorClass = "text-black";
      outcomeColorClass = "bg-gray-100 text-gray-800";
    }
  }

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-3 pb-2">
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
            <div className="text-sm text-muted-foreground mb-1">{isMobile ? homeTeamLabel.substring(0, 12) : homeTeamLabel}</div>
            <div className={`text-xl font-bold ${isHassleholm === 'home' ? scoreTextColorClass : ''}`}>{homeScore}</div>
            {isHassleholm === 'home' && (
              <div className="mt-1 text-xs text-blue-600">Hemmalag</div>
            )}
          </div>
          <div className={`border rounded p-3 text-center ${isHassleholm === 'away' ? 'border-blue-300 bg-blue-50' : ''}`}>
            <div className="text-sm text-muted-foreground mb-1">{isMobile ? awayTeamLabel.substring(0, 12) : awayTeamLabel}</div>
            <div className={`text-xl font-bold ${isHassleholm === 'away' ? scoreTextColorClass : ''}`}>{awayScore}</div>
            {isHassleholm === 'away' && (
              <div className="mt-1 text-xs text-blue-600">Bortalag</div>
            )}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

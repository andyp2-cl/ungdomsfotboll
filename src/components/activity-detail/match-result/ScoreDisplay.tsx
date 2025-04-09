
import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isHomeMatch, getOutcomeText, getOutcomeColorClass, extractTeamNames } from "./utils";
import { Trophy, ShieldCheck, XCircle } from "lucide-react";

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
      <div className="text-center py-4 border border-dashed rounded-md border-gray-300">
        <span className="text-muted-foreground flex items-center justify-center">
          <XCircle className="h-4 w-4 mr-2 opacity-70" />
          Inget resultat registrerat
        </span>
      </div>
    );
  }

  // Determine outcome text and color based on stored isWin or calculate it
  let outcomeText: string;
  let outcomeColorClass: string;
  let outcomeIcon: React.ReactNode;
  
  // Handle draw case first
  if (homeScore === awayScore) {
    outcomeText = "Oavgjort";
    outcomeColorClass = "bg-amber-100 text-amber-800 border border-amber-200";
    outcomeIcon = <ShieldCheck className="h-3.5 w-3.5 mr-1" />;
  } 
  // Then check explicit isWin property
  else if (typeof activity.isWin === 'boolean') {
    if (activity.isWin === true) {
      outcomeText = "Vinst";
      outcomeColorClass = "bg-green-100 text-green-800 border border-green-200";
      outcomeIcon = <Trophy className="h-3.5 w-3.5 mr-1" />;
    } else {
      outcomeText = "Förlust";
      outcomeColorClass = "bg-red-100 text-red-800 border border-red-200";
      outcomeIcon = <XCircle className="h-3.5 w-3.5 mr-1 opacity-70" />;
    }
  } 
  // Fallback to calculating based on scores
  else {
    outcomeText = getOutcomeText(homeScore, awayScore, isHome);
    outcomeColorClass = getOutcomeColorClass(homeScore, awayScore, isHome);
    
    if (outcomeText === "Vinst") {
      outcomeIcon = <Trophy className="h-3.5 w-3.5 mr-1" />;
    } else if (outcomeText === "Oavgjort") {
      outcomeIcon = <ShieldCheck className="h-3.5 w-3.5 mr-1" />;
    } else {
      outcomeIcon = <XCircle className="h-3.5 w-3.5 mr-1 opacity-70" />;
    }
  }
  
  // Also determine text color for score display
  let scoreTextColorClass: string;
  
  if (outcomeText === "Vinst") {
    scoreTextColorClass = "text-green-600";
  } else if (outcomeText === "Förlust") {
    scoreTextColorClass = "text-red-600";
  } else {
    scoreTextColorClass = "text-amber-600";
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-medium">Resultat:</span>
          <span className={`text-xl font-bold ${scoreTextColorClass}`}>{homeScore}-{awayScore}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${outcomeColorClass}`}>
          {outcomeIcon}
          {outcomeText}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className={`border rounded-lg p-3 text-center ${isHassleholm === 'home' ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{homeTeamLabel}</div>
          <div className={`text-2xl font-bold ${isHassleholm === 'home' ? scoreTextColorClass : ''}`}>{homeScore}</div>
          {isHassleholm === 'home' && (
            <div className="mt-1 text-xs text-blue-600 font-medium">Hemmalag</div>
          )}
        </div>
        <div className={`border rounded-lg p-3 text-center ${isHassleholm === 'away' ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{awayTeamLabel}</div>
          <div className={`text-2xl font-bold ${isHassleholm === 'away' ? scoreTextColorClass : ''}`}>{awayScore}</div>
          {isHassleholm === 'away' && (
            <div className="mt-1 text-xs text-blue-600 font-medium">Bortalag</div>
          )}
        </div>
      </div>
    </div>
  );
}

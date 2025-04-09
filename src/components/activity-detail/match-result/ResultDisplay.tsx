
import React from "react";
import { Activity } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { isHomeMatch, getOutcomeText, getOutcomeColorClass } from "./utils";
import { ShieldCheck, Trophy, XCircle } from "lucide-react";

interface ResultDisplayProps {
  activity: Activity;
}

export function ResultDisplay({ activity }: ResultDisplayProps) {
  const homeScore = activity.homeScore;
  const awayScore = activity.awayScore;
  const hasResult = homeScore !== undefined && awayScore !== undefined;
  
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
  let outcomeIcon: React.ReactNode;
  
  // Check for draw first - important to check this before checking isWin
  if (homeScore === awayScore) {
    outcomeText = "Oavgjort";
    outcomeColorClass = "bg-amber-100 text-amber-800 border border-amber-200";
    outcomeIcon = <Trophy className="h-3.5 w-3.5 mr-1" />;
  }
  // Check explicit isWin value
  else if (activity.isWin === true) {
    outcomeText = "Vinst";
    outcomeColorClass = "bg-green-100 text-green-800 border border-green-200";
    outcomeIcon = <Trophy className="h-3.5 w-3.5 mr-1" />;
  } 
  else if (activity.isWin === false) {
    outcomeText = "Förlust";
    outcomeColorClass = "bg-red-100 text-red-800 border border-red-200";
    outcomeIcon = <XCircle className="h-3.5 w-3.5 mr-1 opacity-70" />;
  }
  // Calculate based on scores as fallback
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
  
  // Determine text color for score display
  const scoreTextColorClass = 
    outcomeText === "Vinst" ? "text-green-600" :
    outcomeText === "Förlust" ? "text-red-600" :
    "text-amber-600"; // Draw
  
  // Determine team labels
  const ourTeamLabel = "Våra mål";
  const theirTeamLabel = "Deras mål";
  
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
        <div className={`border rounded-lg p-3 text-center ${isHome ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{isHome ? ourTeamLabel : theirTeamLabel}</div>
          <div className={`text-2xl font-bold ${isHome ? scoreTextColorClass : ""}`}>{homeScore}</div>
          {isHome && (
            <div className="mt-1 text-xs text-blue-600 font-medium">Hemmalag</div>
          )}
        </div>
        <div className={`border rounded-lg p-3 text-center ${!isHome ? 'border-blue-300 bg-blue-50' : ''}`}>
          <div className="text-sm text-muted-foreground mb-1">{isHome ? theirTeamLabel : ourTeamLabel}</div>
          <div className={`text-2xl font-bold ${!isHome ? scoreTextColorClass : ""}`}>{awayScore}</div>
          {!isHome && (
            <div className="mt-1 text-xs text-blue-600 font-medium">Hemmalag</div>
          )}
        </div>
      </div>
    </div>
  );
}


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
  const isHome = isHomeMatch(activity);
  
  if (!hasResult) {
    return (
      <div className="text-center py-4">
        <span className="text-muted-foreground">Inget resultat registrerat</span>
      </div>
    );
  }

  // Determine team labels
  const ourTeamLabel = "Våra mål";
  const theirTeamLabel = "Deras mål";
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="font-medium">Resultat:</span>
          <span className="text-lg font-bold">{homeScore}-{awayScore}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOutcomeColorClass(homeScore, awayScore, isHome)}`}>
          {getOutcomeText(homeScore, awayScore, isHome)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div className="border rounded p-3 text-center">
          <div className="text-sm text-muted-foreground mb-1">{isHome ? ourTeamLabel : theirTeamLabel}</div>
          <div className="text-xl font-bold">{isHome ? homeScore : awayScore}</div>
        </div>
        <div className="border rounded p-3 text-center">
          <div className="text-sm text-muted-foreground mb-1">{isHome ? theirTeamLabel : ourTeamLabel}</div>
          <div className="text-xl font-bold">{isHome ? awayScore : homeScore}</div>
        </div>
      </div>
    </div>
  );
}

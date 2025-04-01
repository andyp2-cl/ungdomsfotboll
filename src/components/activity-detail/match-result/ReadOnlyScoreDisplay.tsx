
import React from "react";

interface ReadOnlyScoreDisplayProps {
  homeTeamLabel: string;
  awayTeamLabel: string;
  homeScore: number | string;
  awayScore: number | string;
}

export function ReadOnlyScoreDisplay({ 
  homeTeamLabel, 
  awayTeamLabel, 
  homeScore, 
  awayScore 
}: ReadOnlyScoreDisplayProps) {
  return (
    <div className="flex items-center justify-center space-x-4 my-4">
      <div className="text-center">
        <p className="text-sm font-medium mb-1">{homeTeamLabel}</p>
        <div className="bg-muted w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold">
          {homeScore}
        </div>
      </div>
      <span className="text-2xl font-bold">-</span>
      <div className="text-center">
        <p className="text-sm font-medium mb-1">{awayTeamLabel}</p>
        <div className="bg-muted w-12 h-12 flex items-center justify-center rounded-md text-xl font-bold">
          {awayScore}
        </div>
      </div>
    </div>
  );
}


import React from "react";
import { Activity } from "@/types/player";
import { isHomeMatch, extractTeamNames, isHassleholm } from "@/components/activity-detail/match-result/utils";

interface SimpleResultViewProps {
  activity: Activity;
}

export function SimpleResultView({ activity }: SimpleResultViewProps) {
  if (activity.type !== 'match') {
    return null;
  }
  
  const hasScores = activity.homeScore !== undefined && activity.awayScore !== undefined;
  if (!hasScores) {
    return null;
  }
  
  // Determine if it's a win, loss or draw
  let resultStatus: 'win' | 'loss' | 'draw';
  
  if (activity.homeScore === activity.awayScore) {
    resultStatus = 'draw';
  } else if (activity.isWin === true) {
    resultStatus = 'win';
  } else if (activity.isWin === false) {
    resultStatus = 'loss';
  } else {
    // Fallback calculation if isWin is not set
    const { homeTeam, awayTeam } = extractTeamNames(activity);
    const isHifHome = isHassleholm(homeTeam);
    const isHifAway = isHassleholm(awayTeam);
    
    if (isHifHome) {
      resultStatus = activity.homeScore! > activity.awayScore! ? 'win' : 'loss';
    } else if (isHifAway) {
      resultStatus = activity.awayScore! > activity.homeScore! ? 'win' : 'loss';
    } else {
      // If we can't determine by team name, fall back to home/away
      const isHome = isHomeMatch(activity);
      if (isHome) {
        resultStatus = activity.homeScore! > activity.awayScore! ? 'win' : 'loss';
      } else {
        resultStatus = activity.awayScore! > activity.homeScore! ? 'win' : 'loss';
      }
    }
  }
  
  // Style based on result
  const resultColor = 
    resultStatus === 'win' ? 'text-green-600' :
    resultStatus === 'loss' ? 'text-red-600' :
    'text-gray-600';
    
  // Status text
  const statusText = 
    resultStatus === 'win' ? '(Vinst)' :
    resultStatus === 'loss' ? '(Förlust)' :
    '(Oavgjort)';

  return (
    <div>
      <div className={`flex items-center text-lg font-bold ${resultColor} mb-1`}>
        <span>{activity.homeScore} - {activity.awayScore}</span>
        <span className="ml-2 text-sm font-normal">{statusText}</span>
      </div>
    </div>
  );
}

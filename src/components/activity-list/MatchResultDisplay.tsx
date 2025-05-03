
import React from "react";
import { Activity } from "@/types/player";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils";

interface MatchResultDisplayProps {
  activity: Activity;
  isMobile?: boolean;
}

export function MatchResultDisplay({ activity, isMobile = false }: MatchResultDisplayProps) {
  // Determine if we have scores to display
  const showResult = activity.homeScore !== undefined && activity.awayScore !== undefined;
  const resultDisplay = showResult ? `${activity.homeScore}-${activity.awayScore}` : "";
  
  // Legacy result message
  let resultMessage = '';
  if (activity.result) {
    resultMessage = `Resultat: ${activity.result}`;
  } else if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    resultMessage = `Resultat: ${activity.homeScore}-${activity.awayScore}`;
  }
  
  // Get color based on win/loss/draw
  const getResultTextColor = () => {
    // If scores are equal (draw)
    if (activity.homeScore === activity.awayScore && 
        activity.homeScore !== undefined && 
        activity.awayScore !== undefined) {
      return "text-gray-600";
    }
    
    // Use the explicit isWin flag if available
    if (activity.isWin === true) {
      return "text-green-600"; // Win
    } else if (activity.isWin === false) {
      return "text-red-600"; // Loss
    }
    
    // If isWin is not available, fall back to calculating based on scores
    if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
      const isHome = isHomeMatch(activity);
      if (isHome) {
        return activity.homeScore > activity.awayScore ? "text-green-600" : "text-red-600";
      } else {
        return activity.awayScore > activity.homeScore ? "text-green-600" : "text-red-600";
      }
    }
    
    return "";
  };

  if (!showResult && !resultMessage) {
    return null;
  }

  return (
    <>
      {showResult && (
        <div className={`${isMobile ? 'text-xl font-bold mb-2' : 'text-2xl font-bold mb-3'} ${getResultTextColor()}`}>
          {resultDisplay}
        </div>
      )}
      {!showResult && resultMessage && (
        <div className={`${isMobile ? 'text-base font-medium mb-2' : 'text-sm font-medium mb-3'} ${getResultTextColor()}`}>
          {resultMessage}
        </div>
      )}
    </>
  );
}

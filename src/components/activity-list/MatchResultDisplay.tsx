import React from "react";
import { Activity } from "@/types/player";
import { 
  extractTeamNames, 
  isHassleholm 
} from "@/components/activity-detail/match-result/utils/team-detection";
import { Check, X, Minus } from "lucide-react";

interface MatchResultDisplayProps {
  activity: Activity;
  isMobile?: boolean;
}

export function MatchResultDisplay({ activity, isMobile = false }: MatchResultDisplayProps) {
  // Determine if we have scores to display
  const showResult = activity.homeScore !== undefined && activity.awayScore !== undefined;
  const resultDisplay = showResult ? `${activity.homeScore}-${activity.awayScore}` : "";
  
  // Get team name information
  const matchName = activity.name || '';
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  
  // Check if Hässleholms IF is one of the teams
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  // Legacy result message
  let resultMessage = '';
  if (activity.result) {
    resultMessage = `Resultat: ${activity.result}`;
  } else if (showResult) {
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
    if (showResult) {
      // Check if Hässleholms IF is one of the teams
      if (isHifHome) {
        return activity.homeScore! > activity.awayScore! ? "text-green-600" : "text-red-600";
      } else if (isHifAway) {
        return activity.awayScore! > activity.homeScore! ? "text-green-600" : "text-red-600";
      }
      
      // If can't identify Hässleholms IF, fall back to home/away logic
      const isHome = isHomeMatch(activity);
      if (isHome) {
        return activity.homeScore! > activity.awayScore! ? "text-green-600" : "text-red-600";
      } else {
        return activity.awayScore! > activity.homeScore! ? "text-green-600" : "text-red-600";
      }
    }
    
    return "";
  };

  const renderResultIcon = () => {
    if (activity.homeScore === activity.awayScore && 
        activity.homeScore !== undefined && 
        activity.awayScore !== undefined) {
      return <Minus className="h-4 w-4 mr-1 text-gray-600" />;
    } else if (activity.isWin === true) {
      return <Check className="h-4 w-4 mr-1 text-green-600" />;
    } else if (activity.isWin === false) {
      return <X className="h-4 w-4 mr-1 text-red-600" />;
    }
    
    // Calculate icon if isWin is not explicitly set
    if (showResult) {
      if (isHifHome) {
        if (activity.homeScore! > activity.awayScore!) {
          return <Check className="h-4 w-4 mr-1 text-green-600" />;
        } else if (activity.homeScore! < activity.awayScore!) {
          return <X className="h-4 w-4 mr-1 text-red-600" />;
        }
      } else if (isHifAway) {
        if (activity.awayScore! > activity.homeScore!) {
          return <Check className="h-4 w-4 mr-1 text-green-600" />;
        } else if (activity.awayScore! < activity.homeScore!) {
          return <X className="h-4 w-4 mr-1 text-red-600" />;
        }
      } else {
        // Fall back to home/away logic
        const isHome = isHomeMatch(activity);
        if (isHome) {
          if (activity.homeScore! > activity.awayScore!) {
            return <Check className="h-4 w-4 mr-1 text-green-600" />;
          } else if (activity.homeScore! < activity.awayScore!) {
            return <X className="h-4 w-4 mr-1 text-red-600" />;
          }
        } else {
          if (activity.awayScore! > activity.homeScore!) {
            return <Check className="h-4 w-4 mr-1 text-green-600" />;
          } else if (activity.awayScore! < activity.homeScore!) {
            return <X className="h-4 w-4 mr-1 text-red-600" />;
          }
        }
      }
      
      // If scores are equal (draw)
      if (activity.homeScore === activity.awayScore) {
        return <Minus className="h-4 w-4 mr-1 text-gray-600" />;
      }
    }
    
    return null;
  };
  
  // Create a more descriptive result text that indicates who won
  const getEnhancedResultText = () => {
    if (!showResult) return resultMessage;
    
    // Draw case
    if (activity.homeScore === activity.awayScore) {
      return `Resultat: ${activity.homeScore}-${activity.awayScore} (Oavgjort)`;
    }
    
    // Check if Hässleholms IF is one of the teams
    if (isHifHome) {
      return activity.homeScore! > activity.awayScore! 
        ? `Resultat: ${activity.homeScore}-${activity.awayScore} (Vinst för Hässleholms IF)`
        : `Resultat: ${activity.homeScore}-${activity.awayScore} (Förlust för Hässleholms IF)`;
    } else if (isHifAway) {
      return activity.awayScore! > activity.homeScore! 
        ? `Resultat: ${activity.homeScore}-${activity.awayScore} (Vinst för Hässleholms IF)`
        : `Resultat: ${activity.homeScore}-${activity.awayScore} (Förlust för Hässleholms IF)`;
    }
    
    // Determine win/loss based on isWin property if available
    if (activity.isWin === true) {
      return `Resultat: ${activity.homeScore}-${activity.awayScore} (Vinst)`;
    } else if (activity.isWin === false) {
      return `Resultat: ${activity.homeScore}-${activity.awayScore} (Förlust)`;
    }
    
    // Calculate win/loss based on home/away if we can't identify by team name
    const isHome = isHomeMatch(activity);
    if (isHome) {
      return activity.homeScore! > activity.awayScore!
        ? `Resultat: ${activity.homeScore}-${activity.awayScore} (Vinst)`
        : `Resultat: ${activity.homeScore}-${activity.awayScore} (Förlust)`;
    } else {
      return activity.awayScore! > activity.homeScore!
        ? `Resultat: ${activity.homeScore}-${activity.awayScore} (Vinst)`
        : `Resultat: ${activity.homeScore}-${activity.awayScore} (Förlust)`;
    }
  };

  if (!showResult && !resultMessage) {
    return null;
  }

  return (
    <>
      {showResult && (
        <div className={`${isMobile ? 'text-xl font-bold mb-2' : 'text-2xl font-bold mb-3'} ${getResultTextColor()} flex items-center`}>
          {renderResultIcon()}
          {resultDisplay}
        </div>
      )}
      {!showResult && resultMessage && (
        <div className={`${isMobile ? 'text-base font-medium mb-2' : 'text-sm font-medium mb-3'} ${getResultTextColor()} flex items-center`}>
          {renderResultIcon()}
          {getEnhancedResultText()}
        </div>
      )}
      {showResult && (
        <div className="text-sm mb-3">
          {getEnhancedResultText()}
        </div>
      )}
    </>
  );
}

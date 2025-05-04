
import { Activity } from "@/types/player";

/**
 * Determines if the current match is a home match for Hässleholms IF
 */
export const isHomeMatch = (activity: Activity): boolean => {
  // Common pattern: "Team A - Team B" where Team A is the home team
  const nameParts = activity.name.split(' - ');
  
  // Check if Hässleholms IF is mentioned in the first part (home)
  if (nameParts.length === 2) {
    return nameParts[0].toLowerCase().includes('hässleholms if');
  }
  
  // For names without the standard format, check if it starts with Hässleholms IF
  return activity.name.toLowerCase().startsWith('hässleholms if');
};

/**
 * Calculates whether the match was a win for Hässleholms IF
 * based on the score and whether it was a home or away match
 */
export const calculateWinStatus = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): boolean | undefined => {
  // If scores are the same, it's a draw (undefined)
  if (homeScore === awayScore) {
    return undefined;
  }
  
  if (isHome) {
    // If Hässleholms IF is the home team
    return homeScore > awayScore;
  } else {
    // If Hässleholms IF is the away team
    return awayScore > homeScore;
  }
};

/**
 * Extracts both team names from the activity name (if possible)
 */
export const extractTeamNames = (activity: Activity): { homeTeam: string; awayTeam: string } => {
  const defaultNames = {
    homeTeam: "Hemmalag",
    awayTeam: "Bortalag"
  };
  
  const nameParts = activity.name.split(' - ');
  
  if (nameParts.length === 2) {
    return {
      homeTeam: nameParts[0],
      awayTeam: nameParts[1]
    };
  }
  
  return defaultNames;
};

/**
 * Gets the appropriate text for a match outcome
 */
export const getOutcomeText = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  if (homeScore === awayScore) {
    return "Oavgjort";
  }
  
  // Determine if Hässleholms IF won
  const didWin = isHome ? homeScore > awayScore : awayScore > homeScore;
  
  return didWin ? "Vinst" : "Förlust";
};

/**
 * Gets the appropriate CSS class for styling based on the match outcome
 */
export const getOutcomeColorClass = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  if (homeScore === awayScore) {
    return "bg-gray-100 text-gray-800"; // Draw styling
  }
  
  // Determine if Hässleholms IF won
  const didWin = isHome ? homeScore > awayScore : awayScore > homeScore;
  
  return didWin 
    ? "bg-green-100 text-green-800" // Win styling
    : "bg-red-100 text-red-800";    // Loss styling
};

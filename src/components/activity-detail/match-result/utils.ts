
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
  console.log("Calculating win status with:", {homeScore, awayScore, isHome});
  
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

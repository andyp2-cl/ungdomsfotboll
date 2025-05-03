
import { Activity } from "@/types/player";
import { isHomeMatch } from "./team-detection";
import { determineMatchOutcome } from "./outcome-calculation";

/**
 * Get the CSS class based on the match result
 */
export const getResultColorClass = (activity: Activity): string => {
  // If we don't have scores, return empty class
  if (activity.homeScore === undefined || activity.awayScore === undefined) {
    return '';
  }
  
  // Draw case
  if (activity.homeScore === activity.awayScore) {
    return 'text-gray-600';
  }
  
  // Check explicit win status if available
  if (activity.isWin === true) {
    return 'text-green-600';
  } else if (activity.isWin === false) {
    return 'text-red-600';
  }
  
  // Fall back to calculating based on score
  const isHome = isHomeMatch(activity);
  if (isHome) {
    return activity.homeScore > activity.awayScore ? 'text-green-600' : 'text-red-600';
  } else {
    return activity.awayScore > activity.homeScore ? 'text-green-600' : 'text-red-600';
  }
};

/**
 * Get the outcome text based on scores and home/away status
 */
export const getOutcomeText = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  // Handle draw case
  if (homeScore === awayScore) {
    return "Oavgjort";
  }
  
  // For home matches
  if (isHome) {
    return homeScore > awayScore ? "Vinst" : "Förlust";
  } 
  // For away matches
  else {
    return awayScore > homeScore ? "Vinst" : "Förlust";
  }
};

/**
 * Get the CSS color class for the outcome based on scores and home/away status
 */
export const getOutcomeColorClass = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  // Handle draw case
  if (homeScore === awayScore) {
    return "bg-gray-100 text-gray-800";
  }
  
  // For home matches
  if (isHome) {
    return homeScore > awayScore 
      ? "bg-green-100 text-green-800" // Win
      : "bg-red-100 text-red-800";    // Loss
  } 
  // For away matches
  else {
    return awayScore > homeScore 
      ? "bg-green-100 text-green-800" // Win
      : "bg-red-100 text-red-800";    // Loss
  }
};

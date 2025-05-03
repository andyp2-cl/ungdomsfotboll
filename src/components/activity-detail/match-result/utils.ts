
import { Activity } from "@/types/player";

/**
 * Extracts team names from an activity name
 */
export const extractTeamNames = (activity: Activity): { homeTeam: string, awayTeam: string } => {
  // Default values
  let homeTeam = "Hemmalag";
  let awayTeam = "Bortalag";
  
  if (activity.name) {
    // Attempt to extract team names from activity name format "Team A - Team B"
    const parts = activity.name.split(/\s*-\s*/);
    if (parts.length >= 2) {
      homeTeam = parts[0].trim();
      awayTeam = parts[1].trim();
    }
  }
  
  return { homeTeam, awayTeam };
};

/**
 * Determines if the activity is a home match for our team
 */
export const isHomeMatch = (activity: Activity): boolean => {
  // Look for keywords indicating away game
  if (activity.name) {
    const lowerCaseName = activity.name.toLowerCase();
    if (lowerCaseName.includes("borta") || 
        lowerCaseName.includes(" b ") ||
        lowerCaseName.endsWith(" b")) {
      return false;
    }
    
    // Common format: "Team A - Team B" where Team A is the home team
    // Check if "Hässleholms" or "HIF" is mentioned first
    if (lowerCaseName.startsWith("hif") || 
        lowerCaseName.startsWith("hässleholms") ||
        lowerCaseName.startsWith("hassleholm")) {
      return true;
    }
  }
  
  // Default to home match if can't determine
  return true;
};

/**
 * Calculates win status based on scores and team position
 */
export const calculateWinStatus = (
  homeScore?: number,
  awayScore?: number,
  isHomeTeam: boolean = true
): boolean | undefined => {
  // If scores are undefined or equal, it's a draw (undefined)
  if (homeScore === undefined || awayScore === undefined || homeScore === awayScore) {
    return undefined;
  }
  
  if (isHomeTeam) {
    return homeScore > awayScore;
  } else {
    return awayScore > homeScore;
  }
};

/**
 * Gets the appropriate color class based on match result
 */
export const getResultColorClass = (activity: Activity): string => {
  // If it's a draw (scores are equal)
  if (activity.homeScore !== undefined && 
      activity.awayScore !== undefined && 
      activity.homeScore === activity.awayScore) {
    return "text-amber-600";
  }
  
  // If win/loss is explicitly set
  if (activity.isWin === true) {
    return "text-green-600";
  } else if (activity.isWin === false) {
    return "text-red-600";
  }
  
  // Default
  return "";
};

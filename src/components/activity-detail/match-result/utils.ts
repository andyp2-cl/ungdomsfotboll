
import { Activity } from "@/types/player";

/**
 * Determines if the match is a home match for Hässleholms IF
 */
export function isHomeMatch(activity: Activity): boolean {
  // Check if the activity name contains information about who's home/away
  if (activity.name.toLowerCase().includes(' vs ')) {
    // Format: "Team A vs Team B" where Team A is the home team
    const teams = activity.name.toLowerCase().split(' vs ');
    return teams[0].includes('hässleholms if');
  } else {
    // If there's no "vs" in the name, we assume it's a home match if Hässleholms IF is mentioned first
    return activity.name.toLowerCase().startsWith('hässleholms if');
  }
}

/**
 * Determines the outcome text based on scores
 */
export function getOutcomeText(homeScore?: number, awayScore?: number, isHomeTeam: boolean = true): string {
  if (homeScore === undefined || awayScore === undefined) return "Inget resultat";
  
  if (homeScore === awayScore) return "Oavgjort";
  
  if (isHomeTeam) {
    // For home games, we WIN when homeScore is greater than awayScore
    return homeScore > awayScore ? "Vinst" : "Förlust";
  } else {
    // For away games, we WIN when awayScore is greater than homeScore
    return awayScore > homeScore ? "Vinst" : "Förlust";
  }
}

/**
 * Determines the CSS class for the outcome badge
 */
export function getOutcomeColorClass(homeScore?: number, awayScore?: number, isHomeTeam: boolean = true): string {
  if (homeScore === undefined || awayScore === undefined) return "bg-gray-100 text-gray-700";
  
  if (homeScore === awayScore) return "bg-blue-100 text-blue-700";
  
  // For home games, win is when homeScore > awayScore
  // For away games, win is when awayScore > homeScore
  const isWin = (isHomeTeam && homeScore > awayScore) || 
               (!isHomeTeam && awayScore > homeScore);
               
  return isWin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
}

/**
 * Calculates the win status for an activity
 */
export function calculateWinStatus(homeScore?: number, awayScore?: number, isHomeMatch: boolean = true): boolean | undefined {
  if (homeScore === undefined || awayScore === undefined) {
    return undefined;
  }
  
  if (homeScore === awayScore) {
    return undefined; // Draw
  } else if (isHomeMatch) {
    // For home games: win if homeScore > awayScore
    return homeScore > awayScore;
  } else {
    // For away games: win if awayScore > homeScore
    return awayScore > homeScore;
  }
}

/**
 * Extracts team names from activity name (if possible)
 */
export function extractTeamNames(activity: Activity): { homeTeam: string, awayTeam: string } {
  if (activity.name.toLowerCase().includes(' vs ')) {
    const teams = activity.name.split(' vs ');
    return {
      homeTeam: teams[0].trim(),
      awayTeam: teams[1].trim()
    };
  }
  
  // Default fallback
  return {
    homeTeam: "Hemmalag",
    awayTeam: "Bortalag"
  };
}

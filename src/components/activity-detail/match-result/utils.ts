
import { Activity } from "@/types/player";

/**
 * Determines if the match is a home match for Hässleholms IF
 */
export function isHomeMatch(activity: Activity): boolean {
  return activity.name.toLowerCase().includes('hässleholms if') && 
         !activity.name.toLowerCase().includes(' vs ') || 
         activity.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
}

/**
 * Determines the outcome text based on scores
 */
export function getOutcomeText(homeScore?: number, awayScore?: number, isHomeTeam: boolean = true): string {
  if (homeScore === undefined || awayScore === undefined) return "Inget resultat";
  
  if (homeScore === awayScore) return "Oavgjort";
  
  if (isHomeTeam) {
    return homeScore > awayScore ? "Vinst" : "Förlust";
  } else {
    return awayScore > homeScore ? "Vinst" : "Förlust";
  }
}

/**
 * Determines the CSS class for the outcome badge
 */
export function getOutcomeColorClass(homeScore?: number, awayScore?: number, isHomeTeam: boolean = true): string {
  if (homeScore === undefined || awayScore === undefined) return "bg-gray-100 text-gray-700";
  
  if (homeScore === awayScore) return "bg-blue-100 text-blue-700";
  
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
    return homeScore > awayScore;
  } else {
    return awayScore > homeScore;
  }
}

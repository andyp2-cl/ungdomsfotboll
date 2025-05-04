
import { Activity } from "@/types/player";

/**
 * Determines if a match is a home match based on the activity name
 * @param activity The match activity
 * @returns true if this is a home match, false otherwise
 */
export function isHomeMatch(activity: Activity): boolean {
  const name = activity.name?.toLowerCase() || "";
  return name.startsWith("hässleholms if") || name.startsWith("hässleholms") || name.startsWith("hassleholm");
}

/**
 * Determines the match outcome for Hässleholm IF based on scores
 */
export function determineOutcome(activity: Activity, homeScore?: number, awayScore?: number): boolean | undefined {
  if (homeScore === undefined || awayScore === undefined) return undefined;
  if (homeScore === awayScore) return undefined; // Draw
  
  const isHome = isHomeMatch(activity);
  
  if (isHome) {
    return homeScore > awayScore; // Win if home team scored more
  } else {
    return awayScore > homeScore; // Win if away team scored more
  }
}

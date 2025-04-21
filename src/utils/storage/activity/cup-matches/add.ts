
import { Activity, CupMatch } from "@/types/player";

/**
 * Adds cup matches to an activity
 * @param activity The activity to add matches to
 * @param matches The matches to add
 */
export async function addCupMatchesToActivity(activity: Activity, matches: CupMatch[]) {
  // Get existing matches
  const existingMatches = activity.matches || [];
  
  // Add new matches
  const updatedMatches = [...existingMatches, ...matches.map(match => match.id || crypto.randomUUID())];

  // Update the activity with the new matches
  const updatedActivity: Activity = {
    ...activity,
    matches: updatedMatches,
  };

  return updatedActivity;
}

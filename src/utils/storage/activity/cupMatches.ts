
import { Activity } from "@/types/player";
import { addCupMatches } from "./cup-matches/add";

// Re-export the addCupMatches function for backwards compatibility
export { addCupMatches as addCupMatchesToActivity };

// Original functionality to be maintained for backward compatibility
export const addCupMatches = async (
  cupActivity: Activity,
  matches: Activity[]
): Promise<boolean> => {
  return await addCupMatches(cupActivity, matches);
};

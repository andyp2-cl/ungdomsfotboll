
import { logDatabaseChange } from "@/lib/supabase/logs";

/**
 * Logs the restoration to the database
 */
export const logRestoration = async (
  playersCount: number, 
  activitiesCount: number, 
  matchCount: number
): Promise<boolean> => {
  try {
    await logDatabaseChange(
      'restore',
      'backup',
      'all',
      `Restored from backup: ${playersCount} players and ${activitiesCount} activities including ${matchCount} matches`
    );
    return true;
  } catch (error) {
    console.error("Error logging restoration (non-critical):", error);
    return false;
  }
};


import { Activity } from "@/types/player";
import { Json } from "@/types/supabase";
import { extractCupMatchesFromPlayerStats, addMatchToPlayerStats } from "@/utils/player-stats";

/**
 * Extract cup matches array from player_stats
 * @deprecated Use extractCupMatchesFromPlayerStats from @/utils/player-stats instead
 */
export function extractCupMatchesFromPlayerStats(playerStats: any): string[] {
  return extractCupMatchesFromPlayerStats(playerStats);
}

/**
 * Safely update player stats with cup matches
 * @deprecated Use addMatchToPlayerStats from @/utils/player-stats instead
 */
export function addMatchToPlayerStats(playerStats: any, matchId: string): Record<string, any> {
  return addMatchToPlayerStats(playerStats, matchId);
}

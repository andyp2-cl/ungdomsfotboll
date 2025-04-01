
/**
 * Utility to ensure player_stats is always a properly formatted object
 */
export function normalizePlayerStats(playerStats: any) {
  if (!playerStats) {
    return { goals: {}, assists: {} };
  }
  
  if (typeof playerStats === 'string') {
    try {
      const parsed = JSON.parse(playerStats);
      // Handle double-stringified JSON
      if (typeof parsed === 'string') {
        try {
          const doubleParsed = JSON.parse(parsed);
          return {
            ...doubleParsed,
            goals: doubleParsed.goals || {},
            assists: doubleParsed.assists || {}
          };
        } catch (e) {
          console.error("Error parsing double-stringified player_stats:", e);
          return { goals: {}, assists: {} };
        }
      }
      return {
        ...parsed,
        goals: parsed.goals || {},
        assists: parsed.assists || {}
      };
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { goals: {}, assists: {} };
    }
  }
  
  // If it's already an object, ensure it has the necessary properties
  return {
    ...playerStats,
    goals: playerStats.goals || {},
    assists: playerStats.assists || {}
  };
}

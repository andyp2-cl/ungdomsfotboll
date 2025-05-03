
import { PlayerStats } from "@/types/player";

/**
 * Centraliserad hantering av spelarstatistik
 * Ersätter duplicerade funktioner från olika delar av koden
 */

/**
 * Normaliserar spelarstatistik från olika format till en konsekvent struktur
 */
export const normalizePlayerStats = (playerStatsJson: any): PlayerStats => {
  // Om player_stats är undefined eller null, skapa ett tomt objekt
  if (!playerStatsJson) {
    return { 
      goals: {}, 
      assists: {},
      cup_matches: [],
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }
  
  // Om player_stats är en sträng, parsa den
  if (typeof playerStatsJson === 'string') {
    try {
      playerStatsJson = JSON.parse(playerStatsJson);
      // Hantera dubbelt stringifierad JSON
      if (typeof playerStatsJson === 'string') {
        try {
          playerStatsJson = JSON.parse(playerStatsJson);
        } catch (e) {
          console.error("Error parsing double-stringified player_stats:", e);
        }
      }
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      return { 
        goals: {}, 
        assists: {},
        cup_matches: [],
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0
      };
    }
  }
  
  // Se till att goals och assists är objekt, inte nummer
  const goals = typeof playerStatsJson.goals === 'object' && playerStatsJson.goals !== null ? 
    playerStatsJson.goals : {};
  
  const assists = typeof playerStatsJson.assists === 'object' && playerStatsJson.assists !== null ? 
    playerStatsJson.assists : {};
    
  const cup_matches = Array.isArray(playerStatsJson.cup_matches) ? playerStatsJson.cup_matches : [];
  
  console.log("Normalized player stats:", { 
    originalGoals: playerStatsJson.goals, 
    originalAssists: playerStatsJson.assists,
    normalizedGoals: goals,
    normalizedAssists: assists
  });
  
  // Skapa ett korrekt formaterat objekt
  return {
    ...playerStatsJson,
    goals,
    assists,
    cup_matches,
    matches: playerStatsJson.matches || 0,
    wins: playerStatsJson.wins || 0,
    draws: playerStatsJson.draws || 0,
    losses: playerStatsJson.losses || 0,
    // Inkludera eventuella scores och isWin om de finns
    scores: playerStatsJson.scores,
    isWin: playerStatsJson.isWin
  };
};

/**
 * Extraherar cupmatcher från spelarstatistik
 */
export function extractCupMatchesFromPlayerStats(playerStats: any): string[] {
  // Hantera strängformat (behöver parsas)
  if (typeof playerStats === 'string') {
    try {
      const parsedStats = JSON.parse(playerStats);
      if (parsedStats && typeof parsedStats === 'object') {
        return Array.isArray(parsedStats.cup_matches) ? parsedStats.cup_matches : [];
      }
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
      return [];
    }
  }
  
  // Hantera objektformat
  if (playerStats && typeof playerStats === 'object' && playerStats.cup_matches) {
    return Array.isArray(playerStats.cup_matches) ? playerStats.cup_matches : [];
  }
  
  return [];
}

/**
 * Uppdaterar spelarstatistik med en ny matchreferens
 */
export function addMatchToPlayerStats(playerStats: any, matchId: string): PlayerStats {
  const normalizedStats = normalizePlayerStats(playerStats);
  
  // Lägg till matchreferensen om den inte redan finns
  if (!normalizedStats.cup_matches.includes(matchId)) {
    normalizedStats.cup_matches.push(matchId);
  }
  
  return normalizedStats;
}

/**
 * Sammanför två spelarstatistik-objekt
 */
export function mergePlayerStats(baseStats: Partial<PlayerStats>, newStats: Partial<PlayerStats>): PlayerStats {
  // Normalisera både bas- och ny statistik
  const normalizedBase = normalizePlayerStats(baseStats);
  const normalizedNew = normalizePlayerStats(newStats);
  
  console.log("Merging player stats:", {
    baseGoals: normalizedBase.goals,
    baseAssists: normalizedBase.assists,
    newGoals: normalizedNew.goals,
    newAssists: normalizedNew.assists
  });
  
  // Sammanfoga statistiken
  return {
    goals: { ...normalizedBase.goals, ...normalizedNew.goals },
    assists: { ...normalizedBase.assists, ...normalizedNew.assists },
    cup_matches: [...new Set([...normalizedBase.cup_matches, ...normalizedNew.cup_matches])],
    matches: (normalizedNew.matches !== undefined) ? normalizedNew.matches : normalizedBase.matches,
    wins: (normalizedNew.wins !== undefined) ? normalizedNew.wins : normalizedBase.wins,
    draws: (normalizedNew.draws !== undefined) ? normalizedNew.draws : normalizedBase.draws,
    losses: (normalizedNew.losses !== undefined) ? normalizedNew.losses : normalizedBase.losses,
    scores: normalizedNew.scores || normalizedBase.scores,
    isWin: (normalizedNew.isWin !== undefined) ? normalizedNew.isWin : normalizedBase.isWin
  };
}

/**
 * Formaterar spelarstatistik från databasformat till applikationsformat
 */
export const formatPlayerStatsFromDatabase = (item: any): PlayerStats => {
  if (!item) {
    return {
      goals: {},
      assists: {},
      scores: {
        home: undefined,
        away: undefined
      },
      isWin: undefined,
      cup_matches: [],
      matches: 0,
      wins: 0,
      draws: 0,
      losses: 0
    };
  }
  
  // Ensure player_stats is properly handled as an object
  const player_stats = item.player_stats ? 
    (typeof item.player_stats === 'string' ? JSON.parse(item.player_stats) : item.player_stats) : 
    { goals: {}, assists: {} };
    
  console.log("Formatting player stats from database:", {
    originalPlayerStats: item.player_stats,
    parsedPlayerStats: player_stats,
    goals: player_stats.goals,
    assists: player_stats.assists
  });
  
  // Explicit hantering av isWin för att undvika undefined-referensproblem
  const isWinValue = item.is_win === true ? true : item.is_win === false ? false : undefined;
  
  return normalizePlayerStats({
    ...player_stats,
    scores: {
      home: item.home_score,
      away: item.away_score
    },
    isWin: isWinValue,
  });
};

/**
 * Kontrollerar om spelarstatistik har mål eller assist
 */
export function hasPlayerStats(activity: any): boolean {
  if (!activity || !activity.player_stats) return false;
  
  const stats = normalizePlayerStats(activity.player_stats);
  
  // Check if there are any goals
  const hasGoals = stats.goals && Object.keys(stats.goals).length > 0;
  
  // Check if there are any assists
  const hasAssists = stats.assists && Object.keys(stats.assists).length > 0;
  
  return hasGoals || hasAssists;
}

/**
 * Hämtar antal mål för en spelare i en aktivitet
 */
export function getPlayerGoals(activity: any, playerId: string): number {
  if (!activity || !activity.player_stats) return 0;
  
  const stats = normalizePlayerStats(activity.player_stats);
  return stats.goals && stats.goals[playerId] ? Number(stats.goals[playerId]) : 0;
}

/**
 * Hämtar antal assist för en spelare i en aktivitet
 */
export function getPlayerAssists(activity: any, playerId: string): number {
  if (!activity || !activity.player_stats) return 0;
  
  const stats = normalizePlayerStats(activity.player_stats);
  return stats.assists && stats.assists[playerId] ? Number(stats.assists[playerId]) : 0;
}

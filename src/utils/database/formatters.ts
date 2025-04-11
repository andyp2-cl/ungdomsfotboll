
import { Activity, PlayerStats } from "@/types/player";

/**
 * Formats an activity object from our application format to the database format
 */
export const formatActivityForDatabase = (activity: Activity) => {
  // Extract player_stats to ensure correct format
  let playerStatsJson: any = activity.player_stats;
  
  // If player_stats is a string, parse it
  if (typeof playerStatsJson === 'string') {
    try {
      playerStatsJson = JSON.parse(playerStatsJson);
    } catch (e) {
      console.error("Error parsing player_stats string:", e);
      playerStatsJson = { goals: {}, assists: {} };
    }
  }
  
  // If player_stats is undefined or null, create an empty object
  if (!playerStatsJson) {
    playerStatsJson = { goals: {}, assists: {} };
  }
  
  // Create the formatted object
  return {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time,
    location_name: activity.location?.name,
    location_description: activity.location?.description,
    location_gps_link: activity.location?.gpsLink,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId,
    scraped: activity.scraped,
    cup_id: activity.cupId,
    result: activity.result,
    home_score: activity.homeScore,
    away_score: activity.awayScore,
    is_win: activity.isWin,
    player_stats: playerStatsJson, // This is now compatible with JSON
  };
};

/**
 * Formats an activity object from database format to our application format
 */
export const formatActivityFromDatabase = (item: any): Activity => {
  // Create the base activity
  const activity: Activity = {
    id: item.id,
    name: item.name,
    date: item.date,
    type: item.type,
    time: item.time || undefined,
    location: item.location_name ? {
      name: item.location_name,
      description: item.location_description || undefined,
      gpsLink: item.location_gps_link || undefined
    } : undefined,
    kioskAssignedPlayerId: item.kiosk_assigned_player_id || undefined,
    scraped: item.scraped || false,
    participants: [],
    cupId: item.cup_id || undefined,
    matches: [], // Will be populated later if it's a cup
    homeScore: item.home_score,
    awayScore: item.away_score,
    isWin: item.is_win === true ? true : item.is_win === false ? false : undefined
  };
  
  // Set result field if home_score and away_score are available
  if (item.home_score !== null && item.home_score !== undefined && 
      item.away_score !== null && item.away_score !== undefined) {
    activity.result = `${item.home_score}-${item.away_score}`;
  }
  
  // Handle player_stats properly
  if (item.player_stats) {
    try {
      const stats = typeof item.player_stats === 'string' 
        ? JSON.parse(item.player_stats) 
        : item.player_stats;
        
      activity.player_stats = {
        goals: stats.goals || {},
        assists: stats.assists || {},
        scores: {
          home: item.home_score,
          away: item.away_score
        },
        isWin: activity.isWin,
        cup_matches: stats.cup_matches || []
      };
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
      activity.player_stats = {
        goals: {},
        assists: {},
        scores: {
          home: item.home_score,
          away: item.away_score
        },
        isWin: activity.isWin,
        cup_matches: []
      };
    }
  } else {
    activity.player_stats = {
      goals: {},
      assists: {},
      scores: {
        home: item.home_score,
        away: item.away_score
      },
      isWin: activity.isWin,
      cup_matches: []
    };
  }
  
  return activity;
};

/**
 * Formats a player object from our application format to the database format
 */
export const formatPlayerForDatabase = (player: any) => {
  // Ensure positions is properly formatted for database storage
  let positions = player.positions;
  
  // If positions is an array, join it into a string
  if (Array.isArray(positions)) {
    positions = positions;
  } else if (typeof positions === 'string') {
    // If it's already a string, convert to array (space-separated)
    positions = positions.split(' ').filter(p => p.trim() !== '');
  } else {
    positions = null;
  }
  
  // Create a formatted player object for database storage
  return {
    id: player.id,
    name: player.name,
    grade: player.grade || null,
    position: positions || null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null
  };
};

/**
 * Formats a player from database format to our application format
 */
export const formatDatabasePlayer = (dbPlayer: any) => {
  // Ensure the position is always an array
  let positions: string[] = [];
  
  if (dbPlayer.position) {
    if (Array.isArray(dbPlayer.position)) {
      positions = dbPlayer.position;
    } else if (typeof dbPlayer.position === 'string') {
      // If it contains brackets and quotes, it might be a JSON string
      if (dbPlayer.position.includes('[') && dbPlayer.position.includes('"')) {
        try {
          positions = JSON.parse(dbPlayer.position);
        } catch (e) {
          // If parsing fails, treat as space-separated string
          positions = dbPlayer.position.split(' ').filter(p => p.trim() !== '');
        }
      } else {
        // Treat as space-separated string
        positions = dbPlayer.position.split(' ').filter(p => p.trim() !== '');
      }
    }
  }
  
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade || undefined,
    positions: positions,
    jerseyNumber: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined,
    activities: [] // Will be populated separately
  };
};

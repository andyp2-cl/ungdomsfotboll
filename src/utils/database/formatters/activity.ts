
import { Activity } from "@/types/player";

/**
 * Format Activity object for database storage
 * - Converts nested objects into flat structure
 */
export const formatActivityForDatabase = (activity: Activity): any => {
  const { location, player_stats, ...rest } = activity;
  
  const formattedActivity = {
    ...rest,
    location_name: location?.name || null,
    location_description: location?.description || null,
    location_gps_link: location?.gpsLink || null,
    player_stats: player_stats || {},
    // Handle special fields
    cup_name: activity.cupName && activity.cupName !== "no-cup" ? activity.cupName : null,
    cup_id: activity.cupId || null,
  };

  console.log(`Formatted activity for database: ${activity.id} (${activity.name})`);
  
  return formattedActivity;
};

/**
 * Format Activity object from database to application format
 * - Converts flat database structure to nested object structure
 */
export const formatActivityFromDatabase = (item: any): Activity => {
  const activity: Activity = {
    id: item.id,
    name: item.name,
    date: item.date,
    type: item.type as "match" | "cup",
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
    cupName: item.cup_name || undefined,
    matches: [], // Initialize empty matches array for cups
    homeScore: item.home_score,
    awayScore: item.away_score,
    // Properly handle is_win with strict type checking
    isWin: item.is_win === true ? true : item.is_win === false ? false : undefined,
    player_stats: { goals: {}, assists: {} }
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
        isWin: activity.isWin // Use the activity-level isWin value
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
        isWin: activity.isWin
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
      isWin: activity.isWin
    };
  }
  
  return activity;
};

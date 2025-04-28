import { Activity } from "@/types/player";

/**
 * Format Activity object for database storage
 * - Converts nested objects into flat structure
 */
export const formatActivityForDatabase = (activity: Activity): any => {
  const { location, player_stats, ...rest } = activity;
  
  // Create the base formatted activity object
  const formattedActivity = {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time || null,
    location_name: location?.name || null,
    location_description: location?.description || null,
    location_gps_link: location?.gpsLink || null,
    player_stats: player_stats || {},
    cup_id: activity.cupId || null,
    home_score: activity.homeScore !== undefined ? activity.homeScore : null,
    away_score: activity.awayScore !== undefined ? activity.awayScore : null,
    is_win: activity.isWin !== undefined ? activity.isWin : null,
    result: activity.result || null,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId || null,
    scraped: activity.scraped || false,
    league_id: activity.leagueId || null
  };

  // Special handling for cup type activities
  if (activity.type === 'cup') {
    // For cup activities, ensure the cup_id is set to the activity's own ID
    formattedActivity.cup_id = activity.id;
  }

  console.log(`Formatted activity for database: ${activity.id} (${activity.name}) with home_score: ${formattedActivity.home_score}, away_score: ${formattedActivity.away_score}, is_win: ${formattedActivity.is_win}`);
  
  // Ensure no undefined values are passed to the database
  Object.keys(formattedActivity).forEach(key => {
    if (formattedActivity[key] === undefined) {
      formattedActivity[key] = null;
    }
  });
  
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
    // We'll keep cupName in the local model but not save it to the database
    // Store the cup name in memory based on the parent cup's name
    cupName: undefined,
    matches: [], // Initialize empty matches array for cups
    homeScore: item.home_score,
    awayScore: item.away_score,
    // Properly handle is_win with strict type checking
    isWin: item.is_win === true ? true : item.is_win === false ? false : undefined,
    player_stats: { goals: {}, assists: {} },
    // Add league_id from database
    leagueId: item.league_id || undefined,
    league_id: item.league_id || undefined
  };
  
  // For cup type activities, make sure cupId is set properly
  if (activity.type === 'cup') {
    // For cups, set cupId to its own ID if not already set
    if (!activity.cupId) {
      activity.cupId = activity.id;
    }
    // For cups, set cupName to its own name since we need this in the UI
    activity.cupName = activity.name;
  }
  
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

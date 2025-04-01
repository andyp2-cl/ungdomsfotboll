
import { Activity, Player } from "@/types/player";

// Format a player object for database storage
export const formatPlayerForDatabase = (player: Player) => {
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions ? JSON.stringify(player.positions) : null,
    image: player.image || null,
    jersey_number: player.jerseyNumber || null
  };
};

// Format a database player object to our application format
export const formatDatabasePlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade as any,
    positions: dbPlayer.position ? JSON.parse(dbPlayer.position) : undefined,
    activities: [], // This will be populated later
    jerseyNumber: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined
  };
};

// Format an activity object for database storage
export const formatActivityForDatabase = (activity: Activity) => {
  const { location, ...rest } = activity;
  
  return {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time || null,
    location_name: location?.name || null,
    location_description: location?.description || null,
    location_gps_link: location?.gpsLink || null,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId || null,
    cup_id: activity.cupId || null,
    scraped: activity.scraped || false,
    player_stats: activity.player_stats ? JSON.stringify(activity.player_stats) : null,
    result: activity.result || null,
    home_score: activity.homeScore !== undefined ? activity.homeScore : null,
    away_score: activity.awayScore !== undefined ? activity.awayScore : null
  };
};

// Format a database activity object to our application format
export const formatActivityFromDatabase = (dbActivity: any): Activity => {
  const activity: Activity = {
    id: dbActivity.id,
    name: dbActivity.name,
    date: dbActivity.date,
    type: dbActivity.type as any,
    participants: [], // This will be populated later
    scraped: dbActivity.scraped || false
  };
  
  // Add optional fields if they exist
  if (dbActivity.time) activity.time = dbActivity.time;
  
  if (dbActivity.location_name) {
    activity.location = {
      name: dbActivity.location_name
    };
    
    if (dbActivity.location_description) {
      activity.location.description = dbActivity.location_description;
    }
    
    if (dbActivity.location_gps_link) {
      activity.location.gpsLink = dbActivity.location_gps_link;
    }
  }
  
  if (dbActivity.kiosk_assigned_player_id) {
    activity.kioskAssignedPlayerId = dbActivity.kiosk_assigned_player_id;
  }
  
  if (dbActivity.cup_id) {
    activity.cupId = dbActivity.cup_id;
  }
  
  if (dbActivity.player_stats) {
    try {
      activity.player_stats = typeof dbActivity.player_stats === 'string' 
        ? JSON.parse(dbActivity.player_stats) 
        : dbActivity.player_stats;
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
    }
  }
  
  if (dbActivity.result) {
    activity.result = dbActivity.result;
  }
  
  if (dbActivity.home_score !== null && dbActivity.home_score !== undefined) {
    activity.homeScore = dbActivity.home_score;
  }
  
  if (dbActivity.away_score !== null && dbActivity.away_score !== undefined) {
    activity.awayScore = dbActivity.away_score;
  }
  
  return activity;
};

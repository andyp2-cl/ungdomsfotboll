
import { Activity, ActivityType, Player, PlayerGrade, PlayerPosition } from "@/types/player";

// Convert a database activity to our application format
export const formatDatabaseActivity = (activityData: any): Activity => {
  return {
    id: activityData.id,
    name: activityData.name,
    date: activityData.date,
    type: activityData.type as ActivityType,
    time: activityData.time || undefined,
    location: activityData.location_name ? {
      name: activityData.location_name,
      description: activityData.location_description || undefined,
      gpsLink: activityData.location_gps_link || undefined
    } : undefined,
    kioskAssignedPlayerId: activityData.kiosk_assigned_player_id || undefined,
    scraped: activityData.scraped || false,
    cupId: activityData.cup_id || undefined,
    playerStats: activityData.player_stats || undefined,
    // NOTE: participants and matches will be populated separately
  };
};

// Format an activity for saving to the database
export const formatActivityForDatabase = (activity: Activity): any => {
  return {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time || null,
    location_name: activity.location?.name || null,
    location_description: activity.location?.description || null,
    location_gps_link: activity.location?.gpsLink || null,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId || null,
    scraped: activity.scraped || false,
    cup_id: activity.cupId || null,
    player_stats: activity.playerStats || null,
  };
};

// Convert a database player to our application format
export const formatDatabasePlayer = (playerData: any): Player => {
  return {
    id: playerData.id,
    name: playerData.name,
    grade: playerData.grade as PlayerGrade,
    positions: playerData.position ? [playerData.position as PlayerPosition] : undefined,
    jerseyNumber: playerData.jersey_number || undefined,
    image: playerData.image || undefined,
    // activities will be populated separately
  };
};

// Format a player for saving to the database
export const formatPlayerForDatabase = (player: Player): any => {
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions?.length ? player.positions[0] : null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null,
  };
};

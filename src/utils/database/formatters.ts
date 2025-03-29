
import { Player, Activity } from "@/types/player";

// Format a database player to our application Player type
export const formatDatabasePlayer = (dbPlayer: any): Player => {
  return {
    id: dbPlayer.id,
    name: dbPlayer.name,
    grade: dbPlayer.grade,
    positions: dbPlayer.position ? dbPlayer.position.split(' ') : [],
    jerseyNumber: dbPlayer.jersey_number || undefined,
    image: dbPlayer.image || undefined,
    activities: [] // We'll populate this separately
  };
};

// Format a database activity to our application Activity type
export const formatDatabaseActivity = (dbActivity: any): Activity => {
  const activity: Activity = {
    id: dbActivity.id,
    name: dbActivity.name,
    date: dbActivity.date,
    type: dbActivity.type as any,
    participants: [] // We'll populate this separately
  };

  if (dbActivity.time) activity.time = dbActivity.time;
  if (dbActivity.scraped) activity.scraped = dbActivity.scraped;
  if (dbActivity.kiosk_assigned_player_id) activity.kioskAssignedPlayerId = dbActivity.kiosk_assigned_player_id;
  if (dbActivity.cup_id) activity.cupId = dbActivity.cup_id;
  
  if (dbActivity.location_name) {
    activity.location = {
      name: dbActivity.location_name,
      description: dbActivity.location_description || undefined,
      gpsLink: dbActivity.location_gps_link || undefined
    };
  }

  return activity;
};

// Format our application Player type to database format
export const formatPlayerForDatabase = (player: Player) => {
  return {
    id: player.id,
    name: player.name,
    grade: player.grade,
    position: player.positions ? player.positions.join(' ') : null,
    jersey_number: player.jerseyNumber || null,
    image: player.image || null
  };
};

// Format our application Activity type to database format
export const formatActivityForDatabase = (activity: Activity) => {
  const dbActivity: any = {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time || null,
    scraped: activity.scraped || null,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId || null,
    cup_id: activity.cupId || null
  };

  if (activity.location) {
    dbActivity.location_name = activity.location.name;
    dbActivity.location_description = activity.location.description || null;
    dbActivity.location_gps_link = activity.location.gpsLink || null;
  } else {
    dbActivity.location_name = null;
    dbActivity.location_description = null;
    dbActivity.location_gps_link = null;
  }

  return dbActivity;
};

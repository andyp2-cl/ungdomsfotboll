
import { Activity, Player } from "@/types/player";

// Replace mentions of playerStats with player_stats
export const formatActivityForDatabase = (activity: Activity) => {
  const formattedActivity: any = {
    id: activity.id,
    name: activity.name,
    date: activity.date,
    type: activity.type,
    time: activity.time,
    location_name: activity.location?.name,
    location_description: activity.location?.description,
    location_gps_link: activity.location?.gpsLink,
    kiosk_assigned_player_id: activity.kioskAssignedPlayerId,
    cup_id: activity.cupId,
    player_stats: activity.player_stats, // Correctly using player_stats
    result: activity.result,
    home_score: activity.homeScore,
    away_score: activity.awayScore,
    scraped: activity.scraped
  };

  return formattedActivity;
};

export const formatActivityFromDatabase = (dbActivity: any): Activity => {
  const activity: Activity = {
    id: dbActivity.id,
    name: dbActivity.name,
    date: dbActivity.date,
    type: dbActivity.type as any,
    participants: [],
    time: dbActivity.time,
    location: dbActivity.location_name ? {
      name: dbActivity.location_name,
      description: dbActivity.location_description,
      gpsLink: dbActivity.location_gps_link
    } : undefined,
    kioskAssignedPlayerId: dbActivity.kiosk_assigned_player_id,
    cupId: dbActivity.cup_id,
    player_stats: dbActivity.player_stats, // Correctly using player_stats
    result: dbActivity.result,
    homeScore: dbActivity.home_score,
    awayScore: dbActivity.away_score,
    scraped: dbActivity.scraped,
    matches: dbActivity.matches
  };

  return activity;
};


import { Activity } from "@/types/player";
import { normalizePlayerStats, formatPlayerStatsFromDatabase } from './player-stats';

/**
 * Formats an activity object from our application format to the database format
 */
export const formatActivityForDatabase = (activity: Activity) => {
  // Extract player_stats to ensure correct format
  const playerStatsJson = normalizePlayerStats(activity.player_stats);
  
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
    player_stats: playerStatsJson,
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
    matches: [],
    homeScore: item.home_score,
    awayScore: item.away_score,
    isWin: item.is_win === true ? true : item.is_win === false ? false : undefined
  };
  
  // Set result field if home_score and away_score are available
  if (item.home_score !== null && item.home_score !== undefined && 
      item.away_score !== null && item.away_score !== undefined) {
    activity.result = `${item.home_score}-${item.away_score}`;
  }
  
  // Handle player_stats using the utility function
  activity.player_stats = formatPlayerStatsFromDatabase(item);
  
  return activity;
};

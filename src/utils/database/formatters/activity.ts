
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
  };

  console.log(`Formatted activity for database: ${activity.id} (${activity.name})`);
  
  return formattedActivity;
};

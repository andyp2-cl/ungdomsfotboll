import { Activity, Player } from "@/types/player";
import { v4 as uuidv4 } from "uuid";

/**
 * Processes match activities to ensure result data is properly set
 */
export const processMatchData = (activity: any) => {
  // Create a copy of the activity to avoid mutating the original
  const processedActivity = { ...activity };
  
  // Make sure result property is set if we have scores
  if (activity.type === 'match' && 
      activity.homeScore !== undefined && activity.homeScore !== null && 
      activity.awayScore !== undefined && activity.awayScore !== null) {
    processedActivity.result = `${activity.homeScore}-${activity.awayScore}`;
  } else if (activity.type === 'match' &&
      activity.home_score !== undefined && activity.home_score !== null && 
      activity.away_score !== undefined && activity.away_score !== null) {
    processedActivity.result = `${activity.home_score}-${activity.away_score}`;
    // Also ensure homeScore and awayScore are set
    processedActivity.homeScore = activity.home_score;
    processedActivity.awayScore = activity.away_score;
  }
  
  return processedActivity;
};

/**
 * Validates backup data structure
 */
export const validateBackupData = (data: any): boolean => {
  if (!data) return false;
  
  // Check for required top-level properties
  if (!data.players || !data.activities || !data.timestamp) {
    console.error("Missing required backup properties");
    return false;
  }
  
  // Validate players array
  if (!Array.isArray(data.players)) {
    console.error("Players is not an array");
    return false;
  }
  
  // Validate activities array
  if (!Array.isArray(data.activities)) {
    console.error("Activities is not an array");
    return false;
  }
  
  // Check for match activities specifically - log results but don't fail validation
  const matchCount = data.activities.filter((a: any) => a.type === 'match').length;
  console.log(`Backup contains ${matchCount} match activities`);
  
  return true;
};

/**
 * Process backup activities to ensure all required fields are properly set
 */
export const processActivitiesForRestore = (activities: any[]): Activity[] => {
  if (!activities || !Array.isArray(activities)) {
    console.error("Invalid activities data for processing", activities);
    return [];
  }
  
  return activities.map(activity => {
    // Ensure all required fields are present
    const processedActivity: Activity = {
      id: activity.id || `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: activity.name || "Unnamed Activity",
      date: activity.date || new Date().toISOString().split('T')[0],
      type: activity.type || "training",
      
      // Optional fields
      time: activity.time,
      location: activity.location_name ? {
        name: activity.location_name,
        description: activity.location_description,
        gpsLink: activity.location_gps_link
      } : undefined,
      participants: activity.participants || [],
      
      // Match specific fields
      homeScore: activity.homeScore || activity.home_score,
      awayScore: activity.awayScore || activity.away_score,
      isWin: activity.isWin || activity.is_win,
      result: activity.result,
      
      // Keep player statistics if present
      player_stats: activity.player_stats
    };
    
    // Ensure match data is properly set
    if (activity.type === 'match') {
      // Log match data for debugging
      console.log(`Processing match: ${activity.name}`, {
        id: activity.id,
        homeScore: processedActivity.homeScore,
        awayScore: processedActivity.awayScore,
        isWin: processedActivity.isWin,
        has_player_stats: !!processedActivity.player_stats
      });
    }
    
    return processedActivity;
  });
};

/**
 * Retrieves information about the last backup
 */
export const getLastBackupInfo = (): { timestamp: string; playerCount: number; activityCount: number } | null => {
  try {
    const backupData = localStorage.getItem('hassleholmsif_backup');
    
    if (!backupData) {
      return null;
    }
    
    const data = JSON.parse(backupData);
    
    if (!data.timestamp || !Array.isArray(data.players) || !Array.isArray(data.activities)) {
      return null;
    }
    
    // Count match activities specifically
    const matchCount = data.activities.filter((a: any) => a.type === 'match').length;
    console.log(`Backup contains ${matchCount} match activities out of ${data.activities.length} total activities`);
    
    return {
      timestamp: data.timestamp,
      playerCount: data.players.length,
      activityCount: data.activities.length
    };
  } catch (error) {
    console.error("Error getting backup info:", error);
    return null;
  }
};


import { Activity } from "@/types/player";
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
 * Retrieves information about the last backup from localStorage
 */
export const getLastBackupInfo = (): { 
  timestamp: string; 
  playerCount: number; 
  activityCount: number; 
} | null => {
  const backupData = localStorage.getItem('hassleholmsif_backup');
  if (!backupData) return null;
  
  try {
    const backup = JSON.parse(backupData);
    if (!backup.timestamp || !backup.players || !backup.activities) {
      return null;
    }
    
    return {
      timestamp: backup.timestamp,
      playerCount: backup.players.length,
      activityCount: backup.activities.length
    };
  } catch (error) {
    console.error("Error parsing backup info:", error);
    return null;
  }
};

/**
 * Process activities to ensure all required fields are properly set for restoration
 */
export const processActivitiesForRestore = (activities: Activity[]): Activity[] => {
  console.log("Processing activities for restore, count:", activities.length);
  
  // First pass: ensure basic properties are set
  const processedActivities = activities.map(activity => {
    // Deep clone to avoid modifying original
    const processedActivity: Activity = JSON.parse(JSON.stringify(activity));
    
    // Ensure id exists
    if (!processedActivity.id) {
      processedActivity.id = uuidv4();
    }
    
    // Ensure type is valid
    if (!processedActivity.type || (processedActivity.type !== 'match' && processedActivity.type !== 'cup')) {
      processedActivity.type = 'match'; // Default to match if not valid
    }
    
    // Ensure date exists and is a string
    if (!processedActivity.date) {
      processedActivity.date = new Date().toISOString().split('T')[0];
    }
    
    // Ensure name exists
    if (!processedActivity.name) {
      processedActivity.name = `Activity ${processedActivity.id.substring(0, 6)}`;
    }
    
    // Ensure participants array exists
    if (!processedActivity.participants) {
      processedActivity.participants = [];
    }
    
    // Ensure matches array exists for cup activities
    if (processedActivity.type === 'cup' && !processedActivity.matches) {
      processedActivity.matches = [];
    }
    
    // Set default values for match-specific fields if not present
    if (processedActivity.type === 'match') {
      if (processedActivity.homeScore !== undefined && processedActivity.awayScore !== undefined) {
        if (processedActivity.result === undefined) {
          processedActivity.result = `${processedActivity.homeScore}-${processedActivity.awayScore}`;
        }
      }
    }
    
    // Initialize player_stats if not present
    if (!processedActivity.player_stats) {
      processedActivity.player_stats = {
        goals: {},
        assists: {},
        scores: {
          home: processedActivity.homeScore,
          away: processedActivity.awayScore
        },
        isWin: processedActivity.isWin
      };
    }
    
    return processedActivity;
  });
  
  // Second pass: resolve cup and match relationships
  processedActivities.forEach(activity => {
    if (activity.type === 'cup') {
      // For cups, find all matches that reference this cup via cupId
      const matchActivities = processedActivities.filter(
        possibleMatch => possibleMatch.cupId === activity.id
      );
      
      if (matchActivities.length > 0) {
        activity.matches = matchActivities.map(match => match.id);
      }
    }
  });
  
  return processedActivities;
};

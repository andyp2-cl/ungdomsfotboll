
import { BackupData, BackupInfo } from './types';

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
export const getLastBackupInfo = (): BackupInfo | null => {
  const backupData = localStorage.getItem('hassleholmsif_backup');
  if (!backupData) {
    return null;
  }
  
  try {
    const backup: BackupData = JSON.parse(backupData);
    return {
      timestamp: backup.timestamp,
      playerCount: backup.players.length,
      activityCount: backup.activities.length
    };
  } catch (error) {
    console.error("Error parsing backup data:", error);
    return null;
  }
};

/**
 * Process activities to ensure all required fields are properly set for restoration
 */
export const processActivitiesForRestore = (activities: any[]) => {
  return activities.map(activity => {
    // Create a shallow copy of the activity
    const processed = { ...activity };
    
    // Convert database field names to application field names if needed
    if (processed.home_score !== undefined && processed.homeScore === undefined) {
      processed.homeScore = processed.home_score;
    }
    
    if (processed.away_score !== undefined && processed.awayScore === undefined) {
      processed.awayScore = processed.away_score;
    }
    
    if (processed.is_win !== undefined && processed.isWin === undefined) {
      processed.isWin = processed.is_win;
    }
    
    // Ensure match data is properly set
    if (processed.type === 'match') {
      // If we have homeScore and awayScore but no result, generate the result
      if ((processed.homeScore !== undefined && processed.homeScore !== null) && 
          (processed.awayScore !== undefined && processed.awayScore !== null) && 
          !processed.result) {
        processed.result = `${processed.homeScore}-${processed.awayScore}`;
      }
      
      // If we have a result but no scores, try to extract scores from the result
      if (processed.result && 
          (processed.homeScore === undefined || processed.awayScore === undefined)) {
        const scores = processed.result.split('-').map(Number);
        if (scores.length === 2 && !isNaN(scores[0]) && !isNaN(scores[1])) {
          processed.homeScore = scores[0];
          processed.awayScore = scores[1];
          
          // Also set home_score and away_score for database compatibility
          processed.home_score = scores[0];
          processed.away_score = scores[1];
        }
      }
      
      // Determine win status if not explicitly set
      if (processed.isWin === undefined && 
          processed.homeScore !== undefined && processed.awayScore !== undefined) {
        processed.isWin = processed.homeScore > processed.awayScore;
      }
      
      // Initialize or update player_stats
      if (!processed.player_stats) {
        processed.player_stats = {
          goals: {},
          assists: {},
          scores: {
            home: processed.homeScore,
            away: processed.awayScore
          },
          isWin: processed.isWin
        };
      } else {
        // Make sure player_stats is an object, not a string
        if (typeof processed.player_stats === 'string') {
          try {
            processed.player_stats = JSON.parse(processed.player_stats);
          } catch (e) {
            console.error("Error parsing player_stats string:", e);
            processed.player_stats = {
              goals: {},
              assists: {},
              scores: {
                home: processed.homeScore,
                away: processed.awayScore
              },
              isWin: processed.isWin
            };
          }
        }
        
        // Ensure player_stats.scores is set correctly
        processed.player_stats.scores = {
          home: processed.homeScore,
          away: processed.awayScore
        };
        
        // Ensure isWin is set correctly
        processed.player_stats.isWin = processed.isWin;
      }
    }
    
    return processed;
  });
};

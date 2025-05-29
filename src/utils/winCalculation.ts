
import { Activity } from "@/types/player";

/**
 * Standardized win calculation logic
 * Prioritizes isWin field, falls back to result parsing
 */
export const calculateWinStatus = (activity: Activity): boolean | undefined => {
  // First check the explicit isWin field
  if (typeof activity.isWin === 'boolean') {
    return activity.isWin;
  }
  
  // Fallback to parsing result string
  if (activity.result && activity.result.includes('-')) {
    const parts = activity.result.split('-');
    if (parts.length === 2) {
      const homeScore = parseInt(parts[0], 10);
      const awayScore = parseInt(parts[1], 10);
      
      if (!isNaN(homeScore) && !isNaN(awayScore)) {
        if (homeScore === awayScore) {
          return undefined; // Draw
        }
        return homeScore > awayScore; // Win if home team scored more
      }
    }
  }
  
  // If we can't determine, return undefined
  return undefined;
};

/**
 * Calculate win percentage for a player's matches
 */
export const calculateWinPercentage = (matches: Activity[]): number => {
  // Only count completed matches with results
  const completedMatches = matches.filter(match => {
    const today = new Date();
    const matchDate = new Date(match.date);
    return matchDate <= today && (
      typeof match.isWin === 'boolean' || 
      (match.result && match.result.includes('-'))
    );
  });
  
  if (completedMatches.length === 0) {
    return 0;
  }
  
  const wins = completedMatches.filter(match => {
    const winStatus = calculateWinStatus(match);
    return winStatus === true;
  }).length;
  
  return Math.round((wins / completedMatches.length) * 100);
};

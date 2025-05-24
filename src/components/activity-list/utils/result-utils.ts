
/**
 * Utility functions for activity results display
 */

/**
 * Determines the appropriate text color for a match result
 * @param activity The activity with possible score and win information
 * @returns CSS class for text color
 */
export const getResultTextColor = (activity: { 
  homeScore?: number; 
  awayScore?: number;
  isWin?: boolean;
}) => {
  // Draw
  if (activity.homeScore === activity.awayScore && 
      activity.homeScore !== undefined && 
      activity.awayScore !== undefined) {
    return "text-gray-600";
  }
  
  // Win
  if (activity.isWin === true) {
    return "text-green-600";
  }
  
  // Loss
  if (activity.isWin === false) {
    return "text-red-600";
  }
  
  return "";
};

/**
 * Creates a readable result message for an activity
 * @param activity The activity containing result data
 * @returns Formatted result message
 */
export const getResultMessage = (activity: {
  result?: string;
  homeScore?: number;
  awayScore?: number;
}) => {
  if (activity.result) {
    return `Resultat: ${activity.result}`;
  } else if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    return `Resultat: ${activity.homeScore}-${activity.awayScore}`;
  }
  return '';
};

/**
 * Formats activity result for display
 * @param activity The activity containing result data
 * @returns Formatted result string
 */
export const formatResult = (activity: {
  result?: string;
  homeScore?: number;
  awayScore?: number;
  isWin?: boolean;
}) => {
  if (activity.result) {
    return activity.result;
  } else if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    return `${activity.homeScore}-${activity.awayScore}`;
  }
  
  // Fallback based on win status
  if (activity.isWin === true) {
    return "Vinst";
  } else if (activity.isWin === false) {
    return "Förlust";
  }
  
  return "Okänt resultat";
};

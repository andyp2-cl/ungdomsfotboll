
import { Activity } from "@/types/player";

/**
 * Check if the team is the home team based on team name matching
 */
export const isHomeMatch = (activity: Activity): boolean => {
  // We consider ourselves as the home team if:
  // 1. Our name is explicitly in the name of the match as the home team
  // 2. The match is created by us and no explicit away team is specified
  const matchName = activity.name?.toLowerCase() || '';
  
  // Look for common patterns that indicate we're the home team
  const homePatterns = [
    'hif - ', 
    'hässleholms if - ',
    'hässleholm - ',
    'hif mot ',
    'hässleholms if mot '
  ];
  
  // Look for patterns that indicate we're the away team
  const awayPatterns = [
    ' - hif',
    ' - hässleholms if',
    ' - hässleholm',
    ' mot hif',
    ' mot hässleholms if'
  ];
  
  // Check if any home patterns match
  const isHome = homePatterns.some(pattern => 
    matchName.includes(pattern.toLowerCase())
  );
  
  // Check if any away patterns match
  const isAway = awayPatterns.some(pattern => 
    matchName.includes(pattern.toLowerCase())
  );
  
  // If we find explicit patterns, use them
  if (isHome) return true;
  if (isAway) return false;
  
  // Default to home team if no clear indication
  return true;
};

/**
 * Calculate if a match is a win based on scores
 */
export const calculateWinStatus = (
  homeScore?: number, 
  awayScore?: number, 
  isHome?: boolean
): boolean | undefined => {
  // If either score is undefined, we can't determine win status
  if (homeScore === undefined || awayScore === undefined) {
    return undefined;
  }
  
  // If scores are equal, it's a draw (return undefined for draw)
  if (homeScore === awayScore) {
    return undefined;
  }
  
  // Determine if it's a win based on home/away status
  if (isHome) {
    return homeScore > awayScore;
  } else {
    return awayScore > homeScore;
  }
};

/**
 * Get the CSS class based on the match result
 */
export const getResultColorClass = (activity: Activity): string => {
  // If we don't have scores, return empty class
  if (activity.homeScore === undefined || activity.awayScore === undefined) {
    return '';
  }
  
  // Draw case
  if (activity.homeScore === activity.awayScore) {
    return 'text-gray-600';
  }
  
  // Check explicit win status if available
  if (activity.isWin === true) {
    return 'text-green-600';
  } else if (activity.isWin === false) {
    return 'text-red-600';
  }
  
  // Fall back to calculating based on score
  const isHome = isHomeMatch(activity);
  if (isHome) {
    return activity.homeScore > activity.awayScore ? 'text-green-600' : 'text-red-600';
  } else {
    return activity.awayScore > activity.homeScore ? 'text-green-600' : 'text-red-600';
  }
};

/**
 * Extract team names from activity
 */
export const extractTeamNames = (activity: Activity) => {
  const matchName = activity.name || '';
  
  // Default team names
  let homeTeam = 'Hemma';
  let awayTeam = 'Borta';
  
  // Try to parse from name
  if (matchName.includes(' - ')) {
    const parts = matchName.split(' - ');
    if (parts.length >= 2) {
      homeTeam = parts[0].trim();
      awayTeam = parts[1].trim();
    }
  } else if (matchName.includes(' mot ')) {
    const parts = matchName.split(' mot ');
    if (parts.length >= 2) {
      homeTeam = parts[0].trim();
      awayTeam = parts[1].trim();
    }
  }
  
  return { homeTeam, awayTeam };
};

/**
 * Get the outcome text based on scores and home/away status
 */
export const getOutcomeText = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  // Handle draw case
  if (homeScore === awayScore) {
    return "Oavgjort";
  }
  
  // For home matches
  if (isHome) {
    return homeScore > awayScore ? "Vinst" : "Förlust";
  } 
  // For away matches
  else {
    return awayScore > homeScore ? "Vinst" : "Förlust";
  }
};

/**
 * Get the CSS color class for the outcome based on scores and home/away status
 */
export const getOutcomeColorClass = (
  homeScore: number, 
  awayScore: number, 
  isHome: boolean
): string => {
  // Handle draw case
  if (homeScore === awayScore) {
    return "bg-gray-100 text-gray-800";
  }
  
  // For home matches
  if (isHome) {
    return homeScore > awayScore 
      ? "bg-green-100 text-green-800" // Win
      : "bg-red-100 text-red-800";    // Loss
  } 
  // For away matches
  else {
    return awayScore > homeScore 
      ? "bg-green-100 text-green-800" // Win
      : "bg-red-100 text-red-800";    // Loss
  }
};

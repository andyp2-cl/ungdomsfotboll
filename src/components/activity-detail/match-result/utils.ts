
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
    'hässleholms if mot ',
    'hässleholms if vit - ',
    'hif vit - ',
    'hässleholm vit - '
  ];
  
  // Look for patterns that indicate we're the away team
  const awayPatterns = [
    ' - hif',
    ' - hässleholms if',
    ' - hässleholm',
    ' mot hif',
    ' mot hässleholms if',
    ' - hif vit',
    ' - hässleholms if vit',
    ' - hässleholm vit'
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
 * Determine if this is a Hässleholms IF match by checking name patterns
 */
export const isHassleholm = (teamName: string): boolean => {
  const name = teamName.toLowerCase();
  return (
    name.includes('hif') || 
    name.includes('hässleholm') || 
    name.includes('hässleholms if')
  );
};

/**
 * Enhanced logic to determine match outcome for Hässleholms IF
 */
export const determineMatchOutcome = (activity: Activity): boolean | undefined => {
  // First check if explicitly set
  if (activity.isWin !== undefined) {
    return activity.isWin; // Use the explicitly set value
  }

  // If we don't have scores, can't determine outcome
  if (activity.homeScore === undefined || activity.awayScore === undefined) {
    return undefined;
  }

  // Draw case
  if (activity.homeScore === activity.awayScore) {
    return undefined; // Draw is represented as undefined
  }
  
  // Extract team names
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  
  // Check if Hässleholms IF is home or away team
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  console.log(`Match analysis for ${activity.id}:`, {
    matchName: activity.name,
    homeTeam,
    awayTeam, 
    isHifHome,
    isHifAway,
    homeScore: activity.homeScore,
    awayScore: activity.awayScore
  });

  // If neither team is Hässleholms IF, fall back to isHomeMatch
  if (!isHifHome && !isHifAway) {
    const isHome = isHomeMatch(activity);
    return isHome ? (activity.homeScore > activity.awayScore) : (activity.awayScore > activity.homeScore);
  }
  
  // Determine win status based on which team is Hässleholms IF
  if (isHifHome) {
    return activity.homeScore > activity.awayScore;
  } else {
    return activity.awayScore > activity.homeScore;
  }
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

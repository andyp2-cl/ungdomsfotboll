
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

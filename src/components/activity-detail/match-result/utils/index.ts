
// Re-export all utility functions from their respective files
export * from './team-detection';
export * from './outcome-calculation';
export * from './result-display';

// Add direct exports for backwards compatibility
export const extractTeamNames = (activity) => {
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

export const isHomeMatch = (activity) => {
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

export const isHassleholm = (teamName) => {
  const name = teamName.toLowerCase();
  return (
    name.includes('hif') || 
    name.includes('hässleholm') || 
    name.includes('hässleholms if')
  );
};

export const getOutcomeText = (
  homeScore, 
  awayScore, 
  isHome
) => {
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

export const getOutcomeColorClass = (
  homeScore, 
  awayScore, 
  isHome
) => {
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

export const getResultColorClass = (activity) => {
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

export const calculateWinStatus = (
  homeScore, 
  awayScore, 
  isHome
) => {
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

export const determineMatchOutcome = determineOutcome;

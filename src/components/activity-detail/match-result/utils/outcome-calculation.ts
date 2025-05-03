
import { Activity } from "@/types/player";
import { isHomeMatch, extractTeamNames, isHassleholm } from "./team-detection";

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

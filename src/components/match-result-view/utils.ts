
import { Activity } from "@/types/player";
import { extractTeamNames, isHomeMatch, isHassleholm } from "@/components/activity-detail/match-result/utils";
import { TeamInfo } from "./types";

/**
 * Extract team information for use in the match result components
 */
export const extractTeamInfo = (activity: Activity, isMobile: boolean = false): TeamInfo => {
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleHomeName = isHassleholm(teamNames.homeTeam);
  const isHassleAwayName = isHassleholm(teamNames.awayTeam);
  
  // Create appropriate labels with truncation for mobile
  const homeTeamLabel = isMobile ? 
    (isHassleHomeName ? "HIF" : teamNames.homeTeam.substring(0, 8)) : 
    (isHassleHomeName ? "Hässleholms IF" : teamNames.homeTeam);
    
  const awayTeamLabel = isMobile ? 
    (isHassleAwayName ? "HIF" : teamNames.awayTeam.substring(0, 8)) : 
    (isHassleAwayName ? "Hässleholms IF" : teamNames.awayTeam);

  // For highlight styling
  const hassleTeamSide = isHassleHomeName ? 'home' : (isHassleAwayName ? 'away' : 'none');
  
  return {
    homeTeam: teamNames.homeTeam,
    awayTeam: teamNames.awayTeam,
    homeTeamLabel,
    awayTeamLabel,
    isHome,
    hassleTeamSide: hassleTeamSide as 'home' | 'away',
    isHassleHomeName,
    isHassleAwayName
  };
};

/**
 * Get color class for result display based on win/loss/draw status
 */
export const getResultDisplayColorClass = (activity: Activity): string => {
  if (activity.homeScore === undefined || activity.awayScore === undefined) {
    return '';
  }
  
  if (activity.homeScore === activity.awayScore) {
    return 'text-gray-600'; // Draw
  }
  
  if (activity.isWin === true) {
    return 'text-green-600'; // Win
  }
  
  if (activity.isWin === false) {
    return 'text-red-600'; // Loss
  }
  
  // If isWin not defined, try to determine from team names and score
  const teamInfo = extractTeamInfo(activity);
  
  if (teamInfo.isHassleHomeName) {
    return activity.homeScore > activity.awayScore ? 'text-green-600' : 'text-red-600';
  }
  
  if (teamInfo.isHassleAwayName) {
    return activity.awayScore > activity.homeScore ? 'text-green-600' : 'text-red-600';
  }
  
  // Fallback to home/away detection
  return teamInfo.isHome ?
    (activity.homeScore > activity.awayScore ? 'text-green-600' : 'text-red-600') :
    (activity.awayScore > activity.homeScore ? 'text-green-600' : 'text-red-600');
};


import { Activity } from "@/types/player";
import { extractTeamNames, isHomeMatch, isHassleholm } from "../activity-detail/match-result/utils";
import { TeamInfo } from "./types";
import { useIsMobile } from "@/hooks/use-mobile";

export function useTeamInfo(activity: Activity): TeamInfo {
  const isMobile = useIsMobile();
  const isHome = isHomeMatch(activity);
  const teamNames = extractTeamNames(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleHomeName = isHassleholm(teamNames.homeTeam);
  const isHassleAwayName = isHassleholm(teamNames.awayTeam);
  
  // Set which side is Hässleholms IF based on team name analysis
  const hassleTeamSide = isHassleHomeName ? 'home' : isHassleAwayName ? 'away' : (isHome ? 'home' : 'away');
  
  // Create appropriate labels - highlight HIF when it's in the name
  const homeTeamLabel = isHassleHomeName ? "HIF" : teamNames.homeTeam.substring(0, isMobile ? 8 : 15);
  const awayTeamLabel = isHassleAwayName ? "HIF" : teamNames.awayTeam.substring(0, isMobile ? 8 : 15);
  
  return {
    homeTeam: teamNames.homeTeam,
    awayTeam: teamNames.awayTeam,
    homeTeamLabel,
    awayTeamLabel,
    isHome,
    hassleTeamSide,
    isHassleHomeName,
    isHassleAwayName
  };
}

export function processScores(
  homeScore: number | undefined | string, 
  awayScore: number | undefined | string
): { processedHomeScore?: number; processedAwayScore?: number } {
  const processedHomeScore = homeScore !== undefined && homeScore !== null ? 
    (typeof homeScore === 'string' ? parseInt(homeScore as any, 10) : homeScore) : 
    undefined;
    
  const processedAwayScore = awayScore !== undefined && awayScore !== null ? 
    (typeof awayScore === 'string' ? parseInt(awayScore as any, 10) : awayScore) : 
    undefined;
  
  return { processedHomeScore, processedAwayScore };
}

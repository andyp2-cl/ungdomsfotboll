
import { Activity } from "@/types/player";
import { isHomeMatch, extractTeamNames, isHassleholm } from "@/components/activity-detail/match-result/utils/team-detection";

/**
 * Enhanced logic to determine match outcome for Hässleholms IF
 */
export const determineMatchOutcome = (
  activity: Activity, 
  homeScore?: number, 
  awayScore?: number
): boolean | undefined => {
  // Use provided scores if available, otherwise fall back to activity scores
  const finalHomeScore = homeScore !== undefined ? homeScore : activity.homeScore;
  const finalAwayScore = awayScore !== undefined ? awayScore : activity.awayScore;

  // If we don't have scores, can't determine outcome
  if (finalHomeScore === undefined || finalAwayScore === undefined) {
    return undefined;
  }

  // Draw case
  if (finalHomeScore === finalAwayScore) {
    console.log(`Match ${activity.id} is a draw: ${finalHomeScore}-${finalAwayScore}`);
    return undefined; // Draw is represented as undefined
  }
  
  // Extract team names
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  
  // Check if Hässleholms IF is home or away team
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  console.log(`Match outcome analysis for ${activity.id}:`, {
    matchName: activity.name,
    homeTeam,
    awayTeam, 
    isHifHome,
    isHifAway,
    homeScore: finalHomeScore,
    awayScore: finalAwayScore
  });

  // If neither team is Hässleholms IF, fall back to isHomeMatch
  if (!isHifHome && !isHifAway) {
    console.log(`Could not identify HIF in either team name for match ${activity.id}, falling back to isHomeMatch`);
    const isHome = isHomeMatch(activity);
    return isHome ? (finalHomeScore > finalAwayScore) : (finalAwayScore > finalHomeScore);
  }
  
  // Determine win status based on which team is Hässleholms IF
  if (isHifHome) {
    const isWin = finalHomeScore > finalAwayScore;
    console.log(`HIF is home team for match ${activity.id}, outcome: ${isWin ? 'WIN' : 'LOSS'}`);
    return isWin;
  } else {
    const isWin = finalAwayScore > finalHomeScore;
    console.log(`HIF is away team for match ${activity.id}, outcome: ${isWin ? 'WIN' : 'LOSS'}`);
    return isWin;
  }
};

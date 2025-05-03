
import { Activity } from "@/types/player";
import { extractTeamNames, isHassleholm, isHomeMatch } from "@/components/activity-detail/match-result/utils";

/**
 * Determines if the match was a win, loss, or draw for Hässleholms IF
 * based on the scores and team identification
 */
export const determineMatchOutcome = (
  activity: Activity, 
  homeScore?: number, 
  awayScore?: number
): boolean | undefined => {
  // Only calculate outcome if we have scores
  if (homeScore === undefined || awayScore === undefined) {
    return undefined;
  }
  
  // Draw case: scores are equal
  if (homeScore === awayScore) {
    console.log(`Match is a draw: ${homeScore}-${awayScore}`);
    return undefined; // Draw is represented as undefined
  } 
  
  // Extract team names to check which team is Hässleholms IF
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  console.log(`Team detection:`, {
    homeTeam,
    awayTeam,
    isHifHome,
    isHifAway
  });
  
  // If we can identify that Hässleholms IF is home or away, use that to determine win
  if (isHifHome) {
    const isWin = homeScore > awayScore;
    console.log(`HIF is home team, ${isWin ? "win" : "loss"} with score ${homeScore}-${awayScore}`);
    return isWin;
  } else if (isHifAway) {
    const isWin = awayScore > homeScore;
    console.log(`HIF is away team, ${isWin ? "win" : "loss"} with score ${homeScore}-${awayScore}`);
    return isWin;
  } 
  
  // If we can't identify by name, fall back to using isHomeMatch
  const isHome = isHomeMatch(activity);
  const isWin = isHome ? (homeScore > awayScore) : (awayScore > homeScore);
  console.log(`Could not detect HIF in team names, using fallback: isHome=${isHome}, isWin=${isWin}`);
  return isWin;
};

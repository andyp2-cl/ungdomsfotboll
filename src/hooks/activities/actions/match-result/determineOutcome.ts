import { Activity } from "@/types/player";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils/team-detection";
import { extractTeamNames, isHassleholm } from "@/components/activity-detail/match-result/utils/team-detection";

/**
 * Determines if a match was won by Hässleholms IF based on scores and team info
 */
export const determineMatchOutcome = (
  activity: Activity,
  homeScore?: number,
  awayScore?: number
): boolean | undefined => {
  // Return undefined if either score is missing
  if (homeScore === undefined || awayScore === undefined) {
    return undefined;
  }

  // If it's a draw, return undefined (neither win nor loss)
  if (homeScore === awayScore) {
    return undefined;
  }

  // Extract team names to check which team is Hässleholms IF
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  // If we can identify that Hässleholms IF is home or away, use that to determine win
  if (isHifHome) {
    return homeScore > awayScore;
  } else if (isHifAway) {
    return awayScore > homeScore;
  } else {
    // If we can't identify by name, fall back to using isHomeMatch
    const isHome = isHomeMatch(activity);
    return isHome ? (homeScore > awayScore) : (awayScore > homeScore);
  }
};

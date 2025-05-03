// Re-export all cup match related functionality
export * from './PlayerStatsUtil.tsx';

import { Activity } from "@/types/player";
import { isHomeMatch } from "./utils";

/**
 * Prepares updated player stats object for an activity
 */
export const prepareUpdatedPlayerStats = (
  activity: Activity,
  homeScore?: number,
  awayScore?: number,
  isWin?: boolean,
  isHomeTeam: boolean = true
) => {
  // Start with existing player stats or create new object
  const existingStats = activity.player_stats || {};
  
  // Make sure goals and assists objects exist and are properly formatted
  const goals = existingStats.goals || {};
  const assists = existingStats.assists || {};
  
  return {
    ...existingStats,
    goals,
    assists,
    scores: {
      home: homeScore,
      away: awayScore
    },
    isWin
  };
};

/**
 * Gets total goals scored by all players in an activity
 */
export const getTotalGoals = (activity: Activity): number => {
  if (!activity.player_stats?.goals) return 0;
  
  return Object.values(activity.player_stats.goals)
    .reduce((sum, goals) => sum + (Number(goals) || 0), 0);
};

/**
 * Gets total assists recorded by all players in an activity
 */
export const getTotalAssists = (activity: Activity): number => {
  if (!activity.player_stats?.assists) return 0;
  
  return Object.values(activity.player_stats.assists)
    .reduce((sum, assists) => sum + (Number(assists) || 0), 0);
};

/**
 * Gets the team's total score based on match result
 */
export const getTeamScore = (activity: Activity): number => {
  // If we're using player goals, use that as source of truth
  const totalPlayerGoals = getTotalGoals(activity);
  if (totalPlayerGoals > 0) {
    return totalPlayerGoals;
  }
  
  // Otherwise use match score
  if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    const isHome = isHomeMatch(activity);
    return isHome ? activity.homeScore : activity.awayScore;
  }
  
  return 0;
};

/**
 * Gets the opponent's total score based on match result
 */
export const getOpponentScore = (activity: Activity): number => {
  if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
    const isHome = isHomeMatch(activity);
    return isHome ? activity.awayScore : activity.homeScore;
  }
  
  return 0;
};

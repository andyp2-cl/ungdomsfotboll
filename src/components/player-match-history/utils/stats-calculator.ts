
import { Activity, Player } from "@/types/player";
import { sortActivitiesByDate } from "./date-formatter";

export interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  totalMatches: number;
  goalsByMatch: {
    matchId: string;
    matchName: string;
    date: string;
    goals: number;
  }[];
  assistsByMatch: {
    matchId: string;
    matchName: string;
    date: string;
    assists: number;
  }[];
  performance: {
    wins: number;
    draws: number;
    losses: number;
    totalWithResult: number;
    winPercentage: number;
  };
}

// Calculate player stats based on activities
export const calculatePlayerStats = (player: Player, activities: Activity[]): PlayerStats => {
  // Start with default stats
  const stats: PlayerStats = {
    totalGoals: 0,
    totalAssists: 0,
    totalMatches: 0,
    goalsByMatch: [],
    assistsByMatch: [],
    performance: {
      wins: 0,
      draws: 0,
      losses: 0,
      totalWithResult: 0,
      winPercentage: 0,
    },
  };

  // Filter matches - only those the player participated in
  const matches = activities.filter(
    (activity) =>
      activity.type === "match" && activity.participants?.includes(player.id)
  );
  
  // Sort matches by date before processing (newest first)
  const sortedMatches = sortActivitiesByDate(matches);

  // Update total matches
  stats.totalMatches = sortedMatches.length;

  // Calculate goals and assists
  sortedMatches.forEach((match) => {
    // Handle goals
    const goals = match.player_stats?.goals?.[player.id] || 0;
    if (goals > 0) {
      stats.totalGoals += goals;
      stats.goalsByMatch.push({
        matchId: match.id,
        matchName: match.name,
        date: match.date,
        goals,
      });
    }

    // Handle assists
    const assists = match.player_stats?.assists?.[player.id] || 0;
    if (assists > 0) {
      stats.totalAssists += assists;
      stats.assistsByMatch.push({
        matchId: match.id,
        matchName: match.name,
        date: match.date,
        assists,
      });
    }

    // Calculate win/loss statistics
    if (match.isWin !== undefined) {
      if (match.isWin === true) {
        stats.performance.wins++;
      } else if (match.homeScore === match.awayScore && 
                match.homeScore !== undefined && match.awayScore !== undefined) {
        stats.performance.draws++;
      } else if (match.isWin === false) {
        stats.performance.losses++;
      }
      stats.performance.totalWithResult++;
    }
  });

  // Calculate win percentage
  if (stats.performance.totalWithResult > 0) {
    stats.performance.winPercentage = 
      (stats.performance.wins / stats.performance.totalWithResult) * 100;
  }

  return stats;
};

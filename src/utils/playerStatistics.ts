
import { Activity, Player } from "@/types/player";
import { isHomeMatch } from "@/components/activity-detail/match-result/utils";

export interface PlayerStatistics {
  totalMatches: number;
  totalGoals: number;
  totalAssists: number;
  goalsByActivity: {
    activityId: string;
    activityName: string;
    activityDate: string;
    goals: number;
  }[];
  assistsByActivity: {
    activityId: string;
    activityName: string;
    activityDate: string;
    assists: number;
  }[];
  wins: number;
  draws: number;
  losses: number;
  winPercentage: number;
}

export const calculatePlayerStatistics = (player: Player, activities: Activity[]): PlayerStatistics => {
  const playerActivities = activities.filter(activity => 
    player.activities?.includes(activity.id)
  );
  
  const historicalMatches = playerActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return activity.type === "match" && activityDate < today;
  });

  let totalGoals = 0;
  let totalAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  const goalsByActivity: PlayerStatistics['goalsByActivity'] = [];
  const assistsByActivity: PlayerStatistics['assistsByActivity'] = [];

  historicalMatches.forEach(match => {
    // Safely extract player stats
    const playerStats = match.player_stats || {};
    const goals = playerStats.goals?.[player.id] || 0;
    const assists = playerStats.assists?.[player.id] || 0;

    totalGoals += Number(goals);
    totalAssists += Number(assists);

    if (goals > 0) {
      goalsByActivity.push({
        activityId: match.id,
        activityName: match.name,
        activityDate: match.date,
        goals: Number(goals)
      });
    }

    if (assists > 0) {
      assistsByActivity.push({
        activityId: match.id,
        activityName: match.name,
        activityDate: match.date,
        assists: Number(assists)
      });
    }
    
    // First check for draw (equal scores)
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore === match.awayScore) {
      draws++;
    }
    // Then check for explicit win/loss flag
    else if (match.isWin === true) {
      wins++;
    } 
    else if (match.isWin === false) {
      losses++;
    }
    // If no isWin flag but we have scores, calculate based on scores
    else if (match.homeScore !== undefined && match.awayScore !== undefined) {
      // Determine if we're home or away using the utility function
      const isHome = isHomeMatch(match);
                    
      // Calculate if we won
      if (isHome) {
        if (match.homeScore > match.awayScore) wins++;
        else if (match.homeScore < match.awayScore) losses++;
        else draws++;
      } else {
        if (match.awayScore > match.homeScore) wins++;
        else if (match.awayScore < match.homeScore) losses++;
        else draws++;
      }
    }
  });

  // Calculate win percentage from matches that have a result
  const matchesWithResult = wins + draws + losses;
  const winPercentage = matchesWithResult > 0 
    ? Math.round((wins / matchesWithResult) * 100) 
    : 0;

  return {
    totalMatches: historicalMatches.length,
    totalGoals,
    totalAssists,
    goalsByActivity,
    assistsByActivity,
    wins,
    draws,
    losses,
    winPercentage
  };
};

export const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });
};


import { Activity, Player } from "@/types/player";

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
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;

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
    
    // Track match outcome stats
    if (match.isWin === true) {
      wins++;
    } else if (match.isWin === false) {
      losses++;
    } else if (match.homeScore !== undefined && match.awayScore !== undefined && 
              match.homeScore === match.awayScore) {
      draws++;
    }
  });

  return {
    totalMatches: historicalMatches.length,
    totalGoals,
    totalAssists,
    goalsByActivity,
    assistsByActivity,
    wins,
    draws,
    losses,
    winPercentage: historicalMatches.length > 0 
      ? Math.round((wins / historicalMatches.length) * 100) 
      : 0
  };
};

export const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });
};

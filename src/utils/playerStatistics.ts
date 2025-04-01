
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
  const goalsByActivity: PlayerStatistics['goalsByActivity'] = [];
  const assistsByActivity: PlayerStatistics['assistsByActivity'] = [];

  historicalMatches.forEach(match => {
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;

    totalGoals += goals;
    totalAssists += assists;

    if (goals > 0) {
      goalsByActivity.push({
        activityId: match.id,
        activityName: match.name,
        activityDate: match.date,
        goals
      });
    }

    if (assists > 0) {
      assistsByActivity.push({
        activityId: match.id,
        activityName: match.name,
        activityDate: match.date,
        assists
      });
    }
  });

  return {
    totalMatches: historicalMatches.length,
    totalGoals,
    totalAssists,
    goalsByActivity,
    assistsByActivity
  };
};

export const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
  return [...activities].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
  });
};

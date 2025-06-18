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
    
    // First check for draw (equal scores)
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore === match.awayScore) {
      draws++;
    }
    // Then check for explicit win/loss
    else if (match.isWin === true) {
      wins++;
    } 
    else if (match.isWin === false) {
      losses++;
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

export const calculateUniqueTeammates = (playerId: string, activities: Activity[]): number => {
  // Get all activities where the player participated
  const playerActivities = activities.filter(activity => 
    activity.participants?.includes(playerId) && 
    (activity.type === 'match' || activity.type === 'cup')
  );
  
  // Create a Set to store unique teammate IDs
  const uniqueTeammates = new Set<string>();
  
  // Go through each activity and add teammates to the set
  playerActivities.forEach(activity => {
    activity.participants?.forEach(teammateId => {
      // Don't count the player themselves
      if (teammateId !== playerId) {
        uniqueTeammates.add(teammateId);
      }
    });
  });
  
  return uniqueTeammates.size;
};

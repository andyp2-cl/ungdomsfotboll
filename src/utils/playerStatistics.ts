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

export function calculateMatchesWithSamePlayers(activities: Activity[]): {
  count: number;
  matches: Activity[];
  allCombinations: { participants: string[]; matches: Activity[]; count: number }[];
} {
  // Filter out cup matches and keep only regular matches
  const regularMatches = activities.filter(activity => {
    // Must be a match type
    if (activity.type !== "match") return false;
    
    // Check if it's explicitly marked as a cup match
    if (activity.cupId || activity.cupName) {
      return false;
    }
    
    // Don't filter based on year in team names anymore since some teams have years in their names
    return true;
  });

  console.log(`Found ${regularMatches.length} regular matches (non-cup matches)`);
  
  // Create a map to store participant combinations and their matches
  const participantCombinations = new Map<string, Activity[]>();

  // For each pair of matches, check if they share all players from one match
  for (let i = 0; i < regularMatches.length; i++) {
    for (let j = i + 1; j < regularMatches.length; j++) {
      const match1 = regularMatches[i];
      const match2 = regularMatches[j];

      if (!match1.participants || !match2.participants) continue;

      // Check if all players from one match are present in the other match
      const match1Players = new Set(match1.participants);
      const match2Players = new Set(match2.participants);

      // Find the smaller set of players
      const [smallerSet, largerSet] = match1Players.size <= match2Players.size 
        ? [match1Players, match2Players] 
        : [match2Players, match1Players];

      // Check if all players from the smaller set are in the larger set
      let allPlayersPresent = true;
      for (const player of smallerSet) {
        if (!largerSet.has(player)) {
          allPlayersPresent = false;
          break;
        }
      }

      if (allPlayersPresent) {
        // Use the smaller set of players as the key
        const sortedParticipants = Array.from(smallerSet).sort().join(',');
        const existingMatches = participantCombinations.get(sortedParticipants) || [];
        
        // Add both matches if they're not already included
        const newMatches = [...existingMatches];
        if (!newMatches.find(m => m.id === match1.id)) {
          newMatches.push(match1);
        }
        if (!newMatches.find(m => m.id === match2.id)) {
          newMatches.push(match2);
        }
        
        participantCombinations.set(sortedParticipants, newMatches);
      }
    }
  }

  // Convert combinations to array and filter those with more than one match
  const combinations = Array.from(participantCombinations.entries())
    .map(([participantString, matches]) => ({
      participants: participantString.split(','),
      matches: matches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
      count: matches.length
    }))
    .filter(combo => combo.count > 1)
    .sort((a, b) => b.count - a.count);

  // Debug log for found combinations
  combinations.forEach(combo => {
    console.log(`Found combination with ${combo.count} matches and ${combo.participants.length} players:`);
    console.log('Matches:', combo.matches.map(m => `${m.name} (${m.date})`));
  });

  // Get the combination with most matches for backward compatibility
  const maxCombo = combinations[0] || { participants: [], matches: [], count: 0 };

  return {
    count: maxCombo.count,
    matches: maxCombo.matches,
    allCombinations: combinations
  };
}

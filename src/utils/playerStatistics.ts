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
    
    // Also check if the match name contains team names with year suffixes (like "Team 2013")
    // This pattern typically indicates cup or tournament matches
    const name = activity.name?.toLowerCase() || '';
    const hasYearSuffix = name.match(/\s+\d{4}\s*(-|vs|–|mot|\s+)/) !== null;
    
    // If it has a year suffix in the team names, it's likely a cup match
    return !hasYearSuffix;
  });

  console.log(`Found ${regularMatches.length} regular matches (non-cup matches)`);
  
  // Create a map to store participant combinations and their matches
  const participantCombinations = new Map<string, Activity[]>();

  // For each match, create a sorted string of participant IDs
  regularMatches.forEach(match => {
    if (match.participants && match.participants.length > 0) {
      const sortedParticipants = [...match.participants].sort().join(',');
      const existingMatches = participantCombinations.get(sortedParticipants) || [];
      participantCombinations.set(sortedParticipants, [...existingMatches, match]);
      
      // Debug log for each match
      console.log(`Match "${match.name}" (${match.date}) has ${match.participants.length} players`);
    }
  });

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

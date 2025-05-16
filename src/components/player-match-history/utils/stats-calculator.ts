
import { Player, Activity } from "@/types/player";

interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  matchesWithGoals: number;
  matchesWithAssists: number;
  wins: number;
  draws: number;
  losses: number;
  matches: number;
  goals?: number; // Added for compatibility with getPlayerStats
}

export const calculatePlayerStats = (player: Player, matches: Activity[]): PlayerStats => {
  let totalGoals = 0;
  let totalAssists = 0;
  let matchesWithGoals = 0;
  let matchesWithAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  const matchCount = matches.length;

  matches.forEach(match => {
    // Count goals and assists
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;
    
    totalGoals += goals;
    totalAssists += assists;
    
    if (goals > 0) matchesWithGoals++;
    if (assists > 0) matchesWithAssists++;
    
    // First check if scores are equal (draw)
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore === match.awayScore) {
      draws++;
    }
    // Then check explicit win/loss status
    else if (match.isWin === true) {
      wins++;
    } 
    else if (match.isWin === false) {
      losses++;
    }
  });

  return {
    totalGoals,
    totalAssists,
    matchesWithGoals,
    matchesWithAssists,
    wins,
    draws,
    losses,
    matches: matchCount
  };
};

// Add the new getPlayerStats function
export const getPlayerStats = (playerId: string, activities: Activity[]): {
  matches: number;
  goals: number;
  wins: number;
  losses: number;
  draws?: number;
} => {
  const playerMatches = activities.filter(activity => 
    activity.participants?.includes(playerId)
  );
  
  let totalGoals = 0;
  let wins = 0;
  let losses = 0;
  let draws = 0;
  
  playerMatches.forEach(match => {
    // Count goals
    const goals = match.player_stats?.goals?.[playerId] || 0;
    totalGoals += goals;
    
    // Count results
    if (match.homeScore !== undefined && match.awayScore !== undefined && 
        match.homeScore === match.awayScore) {
      draws++;
    } else if (match.isWin === true) {
      wins++;
    } else if (match.isWin === false) {
      losses++;
    }
  });
  
  return {
    matches: playerMatches.length,
    goals: totalGoals,
    wins,
    losses,
    draws
  };
};

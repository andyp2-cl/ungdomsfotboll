
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
  winRate: number; // Add winrate percentage
}

export const calculatePlayerStats = (player: Player, matches: Activity[]): PlayerStats => {
  let totalGoals = 0;
  let totalAssists = 0;
  let matchesWithGoals = 0;
  let matchesWithAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;
  
  // Filter out future matches - only count completed matches
  const completedMatches = matches.filter(match => 
    new Date(match.date) <= new Date()
  );
  
  const matchCount = completedMatches.length;

  completedMatches.forEach(match => {
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

  // Calculate winrate as percentage
  const winRate = matchCount > 0 ? Math.round((wins / matchCount) * 100) : 0;

  return {
    totalGoals,
    totalAssists,
    matchesWithGoals,
    matchesWithAssists,
    wins,
    draws,
    losses,
    matches: matchCount,
    winRate
  };
};

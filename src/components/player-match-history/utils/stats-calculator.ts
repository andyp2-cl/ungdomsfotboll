
import { Player, Activity } from "@/types/player";
import { calculateWinPercentage } from "@/utils/winCalculation";

interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  matchesWithGoals: number;
  matchesWithAssists: number;
  wins: number;
  draws: number;
  losses: number;
  matches: number;
  winRate: number;
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
    
    // Use standardized win calculation
    if (typeof match.isWin === 'boolean') {
      if (match.isWin === true) {
        wins++;
      } else {
        losses++;
      }
    } else if (match.homeScore !== undefined && match.awayScore !== undefined) {
      if (match.homeScore === match.awayScore) {
        draws++;
      } else if (match.homeScore > match.awayScore) {
        wins++;
      } else {
        losses++;
      }
    }
  });

  // Use the standardized win percentage calculation
  const winRate = calculateWinPercentage(completedMatches);

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


import { Player, Activity } from "@/types/player";

interface PlayerStats {
  totalGoals: number;
  totalAssists: number;
  matchesWithGoals: number;
  matchesWithAssists: number;
  wins: number;
  draws: number;
  losses: number;
}

export const calculatePlayerStats = (player: Player, matches: Activity[]): PlayerStats => {
  let totalGoals = 0;
  let totalAssists = 0;
  let matchesWithGoals = 0;
  let matchesWithAssists = 0;
  let wins = 0;
  let draws = 0;
  let losses = 0;

  matches.forEach(match => {
    // Count goals and assists
    const goals = match.player_stats?.goals?.[player.id] || 0;
    const assists = match.player_stats?.assists?.[player.id] || 0;
    
    totalGoals += goals;
    totalAssists += assists;
    
    if (goals > 0) matchesWithGoals++;
    if (assists > 0) matchesWithAssists++;
    
    // Count results using the isWin flag
    if (match.result) {
      if (match.isWin) {
        wins++;
      } else {
        // Check for a draw by comparing scores
        const [score1, score2] = match.result.split('-').map(Number);
        if (!isNaN(score1) && !isNaN(score2) && score1 === score2) {
          draws++;
        } else {
          losses++;
        }
      }
    }
  });

  return {
    totalGoals,
    totalAssists,
    matchesWithGoals,
    matchesWithAssists,
    wins,
    draws,
    losses
  };
};

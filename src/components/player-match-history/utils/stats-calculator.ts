
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
    
    // First check if the isWin property is explicitly set
    if (match.isWin !== undefined) {
      if (match.isWin) wins++;
      else if (match.homeScore === match.awayScore) draws++;
      else losses++;
    }
    // If isWin is not set, determine it based on the score
    else {
      // Check if we're home or away team
      const isHomeTeam = match.name.toLowerCase().includes('hässleholms if') && 
                         !match.name.toLowerCase().includes(' vs ') || 
                         match.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
      
      if (match.homeScore !== undefined && match.awayScore !== undefined) {
        const ourScore = isHomeTeam ? match.homeScore : match.awayScore;
        const theirScore = isHomeTeam ? match.awayScore : match.homeScore;
        
        if (ourScore > theirScore) wins++;
        else if (ourScore === theirScore) draws++;
        else losses++;
      } else if (match.result) {
        const [score1, score2] = match.result.split('-').map(Number);
        if (!isNaN(score1) && !isNaN(score2)) {
          const ourScore = isHomeTeam ? score1 : score2;
          const theirScore = isHomeTeam ? score2 : score1;
          
          if (ourScore > theirScore) wins++;
          else if (ourScore === theirScore) draws++;
          else losses++;
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

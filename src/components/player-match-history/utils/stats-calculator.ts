
import { Player, Activity } from "@/types/player";

export interface PlayerStats {
  matches: number;
  goals: number;
  assists: number;
  wins: number;
  losses: number;
  draws: number;
}

export function calculatePlayerStats(player: Player, activities: Activity[]): PlayerStats {
  // Initialize stats
  const stats: PlayerStats = {
    matches: 0,
    goals: 0,
    assists: 0,
    wins: 0,
    losses: 0,
    draws: 0
  };
  
  // Filter match activities that this player participated in
  const playerMatches = activities.filter(activity => 
    activity.type === 'match' && 
    activity.participants?.includes(player.id)
  );
  
  // Count matches
  stats.matches = playerMatches.length;
  
  // Count goals and assists
  playerMatches.forEach(match => {
    // Count goals
    if (match.player_stats?.goals && match.player_stats.goals[player.id]) {
      stats.goals += match.player_stats.goals[player.id] as number;
    }
    
    // Count assists
    if (match.player_stats?.assists && match.player_stats.assists[player.id]) {
      stats.assists += match.player_stats.assists[player.id] as number;
    }
    
    // Count match results
    if (match.homeScore !== undefined && match.awayScore !== undefined) {
      if (match.isWin) {
        stats.wins += 1;
      } else if (match.homeScore === match.awayScore) {
        stats.draws += 1;
      } else {
        stats.losses += 1;
      }
    }
  });
  
  return stats;
}

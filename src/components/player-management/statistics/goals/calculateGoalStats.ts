
import { Player, Activity } from "@/types/player";

export interface PlayerGoalStat {
  id: string;  // Added id for compatibility
  playerId: string;
  name: string;
  goals: number;
  assists: number;
  matches: number;
}

export interface GoalStatsResult {
  playerStats: PlayerGoalStat[];
  totalStats: {
    goals: number;
    assists: number;
  };
}

export function calculateGoalStats(activities: Activity[], players: Player[]): GoalStatsResult {
  const matches = activities.filter(a => a.type === 'match');
  const stats = new Map<string, PlayerGoalStat>();
  
  // Initialize all players
  players.forEach(player => {
    if (!player.positions?.includes("TRÄNARE")) {
      stats.set(player.id, {
        id: player.id,  // Set id equal to playerId for compatibility
        playerId: player.id,
        name: player.name,
        goals: 0,
        assists: 0,
        matches: 0
      });
    }
  });
  
  // Process all matches
  matches.forEach(match => {
    if (!match.player_stats) return;
    
    // Count participation
    match.participants?.forEach(playerId => {
      const playerStat = stats.get(playerId);
      if (playerStat) {
        playerStat.matches += 1;
      }
    });
    
    // Count goals
    if (match.player_stats.goals) {
      Object.entries(match.player_stats.goals).forEach(([playerId, goals]) => {
        const playerStat = stats.get(playerId);
        if (playerStat) {
          playerStat.goals += goals as number;
        }
      });
    }
    
    // Count assists
    if (match.player_stats.assists) {
      Object.entries(match.player_stats.assists).forEach(([playerId, assists]) => {
        const playerStat = stats.get(playerId);
        if (playerStat) {
          playerStat.assists += assists as number;
        }
      });
    }
  });
  
  // Convert to array and sort by most goals
  const playerStats = Array.from(stats.values())
    .filter(stat => stat.matches > 0) // Only include players who played at least one match
    .sort((a, b) => b.goals - a.goals);
  
  // Calculate totals
  const totalGoals = playerStats.reduce((sum, p) => sum + p.goals, 0);
  const totalAssists = playerStats.reduce((sum, p) => sum + p.assists, 0);
  
  return {
    playerStats,
    totalStats: {
      goals: totalGoals,
      assists: totalAssists
    }
  };
}

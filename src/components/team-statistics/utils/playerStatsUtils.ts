
import { Player, Activity } from "@/types/player";

export interface PlayerStats {
  id: string;
  name: string;
  grade: string;
  goals: number;
  assists: number;
  matches: number;
  winCount: number;
  winRate: number;
  matchCount: number;
}

export function calculatePlayerStats(players: Player[], activities: Activity[]): PlayerStats[] {
  // Get historical matches only
  const historicalMatches = activities.filter(activity => {
    if (activity.type !== "match") return false;
    
    const activityDate = new Date(activity.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return activityDate < today;
  });

  // Calculate stats for each player
  return players
    .filter(player => !player.positions?.includes("TRÄNARE"))
    .map(player => {
      // Get matches this player participated in
      const playerMatches = historicalMatches.filter(match => 
        match.participants?.includes(player.id)
      );
      
      // Calculate total goals and assists
      let goals = 0;
      let assists = 0;
      
      playerMatches.forEach(match => {
        if (match.player_stats?.goals?.[player.id]) {
          goals += Number(match.player_stats.goals[player.id]);
        }
        
        if (match.player_stats?.assists?.[player.id]) {
          assists += Number(match.player_stats.assists[player.id]);
        }
      });
      
      // Count wins
      const wins = playerMatches.filter(match => match.isWin === true).length;
      
      // Calculate win percentage
      const winRate = playerMatches.length > 0 
        ? Math.round((wins / playerMatches.length) * 100)
        : 0;
        
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        goals,
        assists,
        matches: player.activities?.length || 0,
        winCount: wins,
        winRate,
        matchCount: playerMatches.length
      };
    })
    .filter(stats => stats.matchCount > 0)
    .sort((a, b) => b.goals - a.goals);
}

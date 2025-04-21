
import { Player, Activity, PlayerPosition } from '@/types/player';

export interface PlayerPerformanceData {
  id: string;
  name: string;
  position?: string;
  totalGoals: number;
  totalAssists: number;
  goalsAvg: number;
  assistsAvg: number;
  matchCount: number;
  winCount: number;
  drawCount: number;
  lossCount: number;
  winRate: number;
}

export interface PositionPerformanceData {
  position: string;
  participationAvg: number;
  goalsAvg: number;
  assistsAvg: number;
  winRate: number;
  avgMatches: number;
}

export interface TeamSummaryData {
  totalGoals: number;
  totalAssists: number;
  goalData: { name: string; value: number }[];
  assistData: { name: string; value: number }[];
}

// Chart colors for consistent styling
export const CHART_COLORS = [
  '#4f46e5', // indigo-600
  '#0891b2', // cyan-600
  '#16a34a', // green-600
  '#ca8a04', // yellow-600
  '#ea580c', // orange-600
  '#dc2626', // red-600
  '#d946ef', // fuchsia-500
  '#8b5cf6', // violet-500
];

// Prepare player performance data from players and activities
export function preparePerformanceData(players: Player[], activities: Activity[], sortedActivities: Activity[]): PlayerPerformanceData[] {
  return players
    .filter(player => player.positions && !player.positions.includes("TRÄNARE"))
    .map(player => {
      // Find activities this player participated in
      const playerActivities = activities.filter(activity => 
        activity.participants && 
        activity.participants.includes(player.id) &&
        activity.type === 'match'
      );
      
      // Calculate total goals and assists
      let totalGoals = 0;
      let totalAssists = 0;
      let winCount = 0;
      let drawCount = 0;
      let lossCount = 0;
      
      playerActivities.forEach(activity => {
        // Goals
        if (activity.player_stats?.goals && activity.player_stats.goals[player.id]) {
          totalGoals += activity.player_stats.goals[player.id];
        }
        
        // Assists
        if (activity.player_stats?.assists && activity.player_stats.assists[player.id]) {
          totalAssists += activity.player_stats.assists[player.id];
        }
        
        // Win/Draw/Loss
        if (activity.homeScore !== undefined && activity.awayScore !== undefined) {
          if (activity.homeScore === activity.awayScore) {
            drawCount++;
          } else if (activity.isWin === true) {
            winCount++;
          } else if (activity.isWin === false) {
            lossCount++;
          }
        }
      });
      
      // Calculate averages and rates
      const matchCount = playerActivities.length;
      const goalsAvg = matchCount > 0 ? totalGoals / matchCount : 0;
      const assistsAvg = matchCount > 0 ? totalAssists / matchCount : 0;
      const matchesWithResult = winCount + drawCount + lossCount;
      const winRate = matchesWithResult > 0 ? Math.round((winCount / matchesWithResult) * 100) : 0;
      
      return {
        id: player.id,
        name: player.name,
        position: player.positions ? player.positions[0] : undefined,
        totalGoals,
        totalAssists,
        goalsAvg,
        assistsAvg,
        matchCount,
        winCount,
        drawCount,
        lossCount,
        winRate
      };
    })
    .filter(data => data.matchCount > 0); // Only include players who participated in matches
}

// Calculate position-based performance data
export function calculatePositionData(performanceData: PlayerPerformanceData[]): PositionPerformanceData[] {
  const positionMap = new Map<string, {
    players: number;
    totalParticipation: number;
    totalGoals: number;
    totalAssists: number;
    totalWinRate: number;
    totalMatches: number;
  }>();
  
  // Group and calculate totals by position
  performanceData.forEach(player => {
    const position = player.position || 'Unknown';
    
    if (!positionMap.has(position)) {
      positionMap.set(position, {
        players: 0,
        totalParticipation: 0,
        totalGoals: 0,
        totalAssists: 0,
        totalWinRate: 0,
        totalMatches: 0
      });
    }
    
    const posData = positionMap.get(position)!;
    posData.players++;
    posData.totalGoals += player.totalGoals;
    posData.totalAssists += player.totalAssists;
    posData.totalWinRate += player.winRate;
    posData.totalMatches += player.matchCount;
  });
  
  // Convert to array and calculate averages
  return Array.from(positionMap.entries()).map(([position, data]) => {
    return {
      position,
      participationAvg: Math.round(data.totalMatches / data.players),
      goalsAvg: data.totalGoals / data.players,
      assistsAvg: data.totalAssists / data.players,
      winRate: Math.round(data.totalWinRate / data.players),
      avgMatches: data.totalMatches / data.players
    };
  });
}

// Get top scorers sorted by goals
export function getTopScorers(performanceData: PlayerPerformanceData[]): PlayerPerformanceData[] {
  return [...performanceData]
    .sort((a, b) => {
      // Sort by goals first, then by assists
      const goalsDiff = b.totalGoals - a.totalGoals;
      return goalsDiff !== 0 ? goalsDiff : b.totalAssists - a.totalAssists;
    })
    .slice(0, 10); // Get top 10 scorers
}

// Get win rate data sorted by win percentage
export function getWinRateData(performanceData: PlayerPerformanceData[]): PlayerPerformanceData[] {
  return [...performanceData]
    .filter(player => player.matchCount >= 3) // Only include players with at least 3 matches
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10); // Get top 10 by win rate
}

// Calculate team summary stats
export function calculateTeamSummary(performanceData: PlayerPerformanceData[]): TeamSummaryData {
  // Calculate totals
  const totalGoals = performanceData.reduce((sum, player) => sum + player.totalGoals, 0);
  const totalAssists = performanceData.reduce((sum, player) => sum + player.totalAssists, 0);
  
  // Prepare position-based goal data
  const positionGoals = new Map<string, number>();
  
  performanceData.forEach(player => {
    if (player.position) {
      const position = player.position;
      positionGoals.set(
        position, 
        (positionGoals.get(position) || 0) + player.totalGoals
      );
    }
  });
  
  // Format for charts
  const goalData = Array.from(positionGoals.entries()).map(([name, value]) => ({ name, value }));
  const assistData = Array.from(positionGoals.entries()).map(([name, value]) => ({ 
    name, 
    value: performanceData
      .filter(p => p.position === name)
      .reduce((sum, player) => sum + player.totalAssists, 0) 
  }));
  
  return {
    totalGoals,
    totalAssists,
    goalData,
    assistData
  };
}

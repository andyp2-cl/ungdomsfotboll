import { Player, Activity } from "@/types/player";
import { getGradeColor } from '@/utils/gradeUtils';

export interface PlayerPerformanceData {
  id: string;
  name: string;
  grade: string;
  position: string;
  jerseyNumber: string;
  activityCount: number;
  participationRate: number;
  goalsAvg: number;
  assistsAvg: number;
  totalGoals: number;
  totalAssists: number;
  matchCount: number;
  winCount: number;
  drawCount: number;
  winRate: number;
  goalRate: number;
  fill: string;
  activities: string[];
}

export interface PositionPerformanceData {
  position: string;
  count: number;
  participationAvg: number;
  goalsAvg: number;
  assistsAvg: number;
  winRate: number;
  avgMatches: number;
}

export interface TeamSummaryData {
  goalData: { name: string; value: number }[];
  assistData: { name: string; value: number }[];
}

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export const preparePerformanceData = (players: Player[], activities: Activity[], sortedActivities: Activity[]): PlayerPerformanceData[] => {
  return players
    .filter(player => !player.positions?.includes('TRÄNARE'))
    .map(player => {
      const participationCount = player.activities?.length || 0;
      const participationRate = sortedActivities.length > 0 
        ? Math.round((participationCount / sortedActivities.length) * 100) 
        : 0;
      
      let totalGoals = 0;
      let totalAssists = 0;
      let matchCount = 0;
      let winCount = 0;
      let drawCount = 0;
      let goalMatches = 0;

      activities.forEach(activity => {
        if (activity.type === "match" && activity.participants?.includes(player.id)) {
          matchCount++;
          
          if (activity.player_stats) {
            const goals = activity.player_stats.goals?.[player.id] || 0;
            const assists = activity.player_stats.assists?.[player.id] || 0;
            totalGoals += goals;
            totalAssists += assists;
            
            if (goals > 0) {
              goalMatches++;
            }
          }
          
          if (activity.isWin === true) {
            winCount++;
          } else if (activity.isWin === false) {
            // loss, already handled by calculating winCount
          } else if (activity.homeScore !== undefined && activity.awayScore !== undefined && 
                   activity.homeScore === activity.awayScore) {
            drawCount++;
          }
        }
      });

      const goalsAvg = matchCount > 0 ? (totalGoals / matchCount) : 0;
      const assistsAvg = matchCount > 0 ? (totalAssists / matchCount) : 0;
      const winRate = matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0;
      const goalRate = matchCount > 0 ? Math.round((goalMatches / matchCount) * 100) : 0;
      
      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        position: player.positions?.[0] || 'N/A',
        jerseyNumber: player.jerseyNumber || '',
        activityCount: participationCount,
        participationRate: participationRate,
        goalsAvg: goalsAvg,
        assistsAvg: assistsAvg,
        totalGoals,
        totalAssists,
        matchCount,
        winCount,
        drawCount,
        winRate,
        goalRate,
        fill: getGradeColor(player.grade),
        activities: player.activities || []
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const calculatePositionData = (performanceData: PlayerPerformanceData[]): PositionPerformanceData[] => {
  const positions = new Map<string, PositionPerformanceData>();
  
  performanceData.forEach(player => {
    const pos = player.position;
    const current = positions.get(pos) || { 
      position: pos, 
      count: 0, 
      participationAvg: 0, 
      goalsAvg: 0, 
      assistsAvg: 0, 
      winRate: 0,
      avgMatches: 0
    };
    
    current.count += 1;
    current.participationAvg += player.participationRate;
    current.goalsAvg += player.goalsAvg;
    current.assistsAvg += player.assistsAvg;
    current.winRate += player.winRate;
    current.avgMatches += player.matchCount;
    
    positions.set(pos, current);
  });
  
  return Array.from(positions.values()).map(data => ({
    ...data,
    participationAvg: data.count > 0 ? Math.round(data.participationAvg / data.count) : 0,
    goalsAvg: data.count > 0 ? Number((data.goalsAvg / data.count).toFixed(2)) : 0,
    assistsAvg: data.count > 0 ? Number((data.assistsAvg / data.count).toFixed(2)) : 0,
    winRate: data.count > 0 ? Math.round(data.winRate / data.count) : 0,
    avgMatches: data.count > 0 ? Number((data.avgMatches / data.count).toFixed(1)) : 0,
  }));
};

export const getTopScorers = (performanceData: PlayerPerformanceData[]): PlayerPerformanceData[] => {
  return [...performanceData]
    .filter(player => player.totalGoals > 0)
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, 10);
};

export const getWinRateData = (performanceData: PlayerPerformanceData[]): PlayerPerformanceData[] => {
  return [...performanceData]
    .filter(player => player.matchCount >= 3)
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 10);
};

export const calculateTeamSummary = (performanceData: PlayerPerformanceData[]): TeamSummaryData => {
  const goalsByPosition = new Map<string, number>();
  const assistsByPosition = new Map<string, number>();
  
  performanceData.forEach(player => {
    const pos = player.position;
    goalsByPosition.set(pos, (goalsByPosition.get(pos) || 0) + player.totalGoals);
    assistsByPosition.set(pos, (assistsByPosition.get(pos) || 0) + player.totalAssists);
  });
  
  const goalData = Array.from(goalsByPosition.entries())
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
    
  const assistData = Array.from(assistsByPosition.entries())
    .map(([name, value]) => ({ name, value }))
    .filter(item => item.value > 0);
  
  return { goalData, assistData };
};

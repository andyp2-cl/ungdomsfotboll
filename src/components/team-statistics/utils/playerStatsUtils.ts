
import { Player, Activity } from "@/types/player";
import { getGradeColor } from '@/utils/gradeUtils';

export interface PlayerStatistic {
  id: string;
  name: string;
  grade: string;
  position: string;
  jerseyNumber: string;
  activityCount: number;
  participationRate: number;
  goals: number;
  assists: number;
  matchCount: number;
  winCount: number;
  winRate: number;
  fill: string;
  activities: number;
}

export function calculatePlayerStats(players: Player[], activities: Activity[]): PlayerStatistic[] {
  return players.map(player => {
    const activityCount = player.activities?.length || 0;
    const participationRate = activities.length > 0
      ? Math.round((activityCount / activities.length) * 100)
      : 0;

    // Calculate goals and assists
    let totalGoals = 0;
    let totalAssists = 0;
    let matchCount = 0;
    let winCount = 0;

    activities.forEach(activity => {
      if (activity.type === "match" && activity.player_stats && activity.participants?.includes(player.id)) {
        matchCount++;
        totalGoals += activity.player_stats.goals?.[player.id] || 0;
        totalAssists += activity.player_stats.assists?.[player.id] || 0;
        
        // Count wins
        if (activity.result) {
          const resultParts = activity.result.split('-');
          if (resultParts.length === 2) {
            const ourScore = parseInt(resultParts[0], 10);
            const theirScore = parseInt(resultParts[1], 10);
            if (!isNaN(ourScore) && !isNaN(theirScore) && ourScore > theirScore) {
              winCount++;
            }
          }
        }
      }
    });

    const winRate = matchCount > 0 ? Math.round((winCount / matchCount) * 100) : 0;
    
    return {
      id: player.id,
      name: player.name,
      grade: player.grade,
      position: player.positions?.[0] || 'N/A',
      jerseyNumber: player.jerseyNumber || '',
      activityCount,
      participationRate,
      goals: totalGoals,
      assists: totalAssists,
      matchCount,
      winCount,
      winRate,
      fill: getGradeColor(player.grade),
      activities: activityCount
    };
  }).sort((a, b) => b.activityCount - a.activityCount);
}

export function calculateGradeStats(players: Player[]) {
  const gradeMap = new Map<string, { grade: string, count: number, players: number }>();
  
  // Initialize with all grades
  ['A', 'B', 'C', 'D'].forEach(grade => {
    gradeMap.set(grade, { grade, count: 0, players: 0 });
  });
  
  // Count players and activities by grade
  players.forEach(player => {
    if (!gradeMap.has(player.grade)) return;
    
    const gradeData = gradeMap.get(player.grade)!;
    gradeData.players += 1;
    gradeData.count += player.activities?.length || 0;
    gradeMap.set(player.grade, gradeData);
  });
  
  return Array.from(gradeMap.values())
    .map(data => ({
      ...data,
      average: data.players > 0 ? Math.round((data.count / data.players) * 10) / 10 : 0
    }))
    .sort((a, b) => a.grade.localeCompare(b.grade));
}

import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { getGradeChartConfig } from "@/utils/gradeUtils";
import { getGradeColor } from '@/utils/gradeUtils';

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (player: Player) => void;
}

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Calculate player participation statistics
  const playerStats = useMemo(() => {
    return players.map(player => {
      const activityCount = player.activities?.length || 0;
      const participationRate = activities.length > 0
        ? Math.round((activityCount / activities.length) * 100)
        : 0;

      return {
        id: player.id,
        name: player.name,
        grade: player.grade,
        position: player.positions?.[0] || 'N/A',
        jerseyNumber: player.jerseyNumber || '',
        activityCount,
        participationRate,
        fill: getGradeColor(player.grade),
        activities: activityCount,
        player // Include the original player object for selection
      };
    }).sort((a, b) => b.activityCount - a.activityCount);
  }, [players, activities]);

  // Handle player click in charts
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      const playerStat = playerStats.find(p => p.id === playerId);
      if (playerStat?.player) {
        onPlayerSelect(playerStat.player);
      }
    }
  };

  // Chart config
  const chartConfig = getGradeChartConfig();

  // Calculate participation by grade
  const gradeStats = useMemo(() => {
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
  }, [players]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Player activity participation */}
      <Card>
        <CardHeader>
          <CardTitle>Spelarnärvaro</CardTitle>
          <CardDescription>Antal aktiviteter per spelare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <PlayerActivityChart 
              data={playerStats} 
              config={chartConfig} 
              onBarClick={handlePlayerClick}
            />
          </div>
        </CardContent>
      </Card>

      {/* Activity by grade */}
      <Card>
        <CardHeader>
          <CardTitle>Närvaro per nivå</CardTitle>
          <CardDescription>Genomsnittligt antal aktiviteter per spelarnivå</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <GradeStatisticsChart data={gradeStats} config={chartConfig} />
          </div>
        </CardContent>
      </Card>

      {/* Player Count Card */}
      <PlayerSummaryCard data={gradeStats} />
      
      {/* Monthly Activity Trends */}
      <MonthlyActivityChart activities={activities} />
    </div>
  );
}

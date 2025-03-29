
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { getGradeChartConfig } from "@/utils/gradeUtils";

interface TeamStatisticsProps {
  players: Player[];
  activities: Activity[];
}

export function TeamStatistics({ players, activities }: TeamStatisticsProps) {
  // Calculate player participation statistics
  const playerStats = useMemo(() => {
    return players.map(player => {
      const activityCount = player.activities?.length || 0;
      return {
        name: player.name,
        activities: activityCount,
        grade: player.grade,
        id: player.id
      };
    }).sort((a, b) => b.activities - a.activities);
  }, [players]);

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

  // Chart config
  const chartConfig = getGradeChartConfig();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <BarChart3 className="h-6 w-6" />
        Lagstatistik
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Player activity participation */}
        <Card>
          <CardHeader>
            <CardTitle>Spelarnärvaro</CardTitle>
            <CardDescription>Antal aktiviteter per spelare</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <PlayerActivityChart data={playerStats} config={chartConfig} />
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
      </div>
    </div>
  );
}


import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { getGradeChartConfig } from "@/utils/gradeUtils";
import { getGradeColor } from '@/utils/gradeUtils';
import { MatchStatsCard } from '../matches/MatchStatsCard';
import { MatchResultChart } from '../matches/MatchResultChart';
import { calculateMatchStats } from '../matches/utils/calculateMatchStats';

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Calculate player participation statistics - now with more reliable activity counting
  const playerStats = useMemo(() => {
    // Log for debugging
    console.log(`Calculating stats for ${players.length} players and ${activities.length} activities`);
    
    return players.map(player => {
      // Ensure we're properly counting activities for each player
      const playerActivities = player.activities || [];
      const activityCount = playerActivities.length;
      
      // Log for any player with 0 activities to help debug
      if (activityCount === 0) {
        console.log(`Player ${player.name} has 0 activities`);
      }
      
      // Skip coaches in the attendance chart
      const isCoach = player.positions?.includes('TRÄNARE');
      if (isCoach) {
        return null; // We'll filter these out later
      }
      
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
    }).filter(Boolean) // Remove null entries (coaches)
     .sort((a, b) => b.activityCount - a.activityCount);
  }, [players, activities]);

  // Handle player click in charts
  const handlePlayerClick = (playerId: string) => {
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  // Filter match activities
  const matches = activities.filter(activity => String(activity.type) === "match");
  
  // Calculate match statistics
  const matchStats = calculateMatchStats(matches);

  // Chart config
  const chartConfig = {
    ...getGradeChartConfig(),
    gradeColors: {} // Add required gradeColors field
  };

  // Calculate participation by grade
  const gradeStats = useMemo(() => {
    const gradeMap = new Map<string, { grade: string, count: number, players: number }>();
    
    // Initialize with all grades
    ['A', 'B', 'C', 'D'].forEach(grade => {
      gradeMap.set(grade, { grade, count: 0, players: 0 });
    });
    
    // Count players and activities by grade
    players.forEach(player => {
      // Skip coaches
      if (player.positions?.includes('TRÄNARE')) return;
      
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
    <div className="space-y-6">
      {/* Match Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MatchStatsCard activities={matches} />
        
        <Card>
          <CardHeader>
            <CardTitle>Matchresultat</CardTitle>
            <CardDescription>Fördelning av vinster, oavgjorda och förluster</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            <MatchResultChart matchStats={matchStats} />
          </CardContent>
        </Card>
      </div>
      
      {/* Player and Grade Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
    </div>
  );
}

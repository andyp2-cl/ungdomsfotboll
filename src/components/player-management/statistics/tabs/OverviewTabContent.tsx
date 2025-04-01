
import React from "react";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { calculateGradeStats } from "@/components/team-statistics/utils/playerStatsUtils";
import { getGradeColor } from "@/utils/gradeUtils";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function OverviewTabContent({ players, activities }: OverviewTabContentProps) {
  // Calculate player activity data - FIXED to properly count participation
  const playerActivityData = React.useMemo(() => {
    return players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .map(player => {
        // Count activities the player is participating in
        const participatedActivities = activities.filter(activity => 
          activity.participants?.includes(player.id)
        ).length;
        
        return {
          id: player.id,
          name: player.name,
          grade: player.grade,
          activities: participatedActivities,
          fill: getGradeColor(player.grade)
        };
      })
      .sort((a, b) => b.activities - a.activities)
      .slice(0, 10); // Top 10 players
  }, [players, activities]);

  // Calculate grade statistics - FIXED to properly count participation by grade
  const gradeStats = React.useMemo(() => {
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
      
      // Count activities for this player
      const playerActivitiesCount = activities.filter(activity => 
        activity.participants?.includes(player.id)
      ).length;
      
      gradeData.count += playerActivitiesCount;
      gradeMap.set(player.grade, gradeData);
    });
    
    return Array.from(gradeMap.values())
      .map(data => ({
        ...data,
        average: data.players > 0 ? Math.round((data.count / data.players) * 10) / 10 : 0
      }))
      .sort((a, b) => a.grade.localeCompare(b.grade));
  }, [players, activities]);

  // Chart configurations
  const playerChartConfig = {
    activities: {
      label: "Antal aktiviteter"
    }
  };

  const gradeChartConfig = {
    average: {
      label: "Genomsnitt per spelare"
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Player activity chart */}
      <Card>
        <CardHeader>
          <CardTitle>Spelarnärvaro</CardTitle>
          <CardDescription>Antal aktiviteter per spelare</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <PlayerActivityChart data={playerActivityData} config={playerChartConfig} />
          </div>
        </CardContent>
      </Card>

      {/* Grade statistics chart */}
      <Card>
        <CardHeader>
          <CardTitle>Närvaro per nivå</CardTitle>
          <CardDescription>Genomsnittligt antal aktiviteter per nivå</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <GradeStatisticsChart data={gradeStats} config={gradeChartConfig} />
          </div>
        </CardContent>
      </Card>

      {/* Player attendance analytics */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Närvaro Analys</CardTitle>
          <CardDescription>Topp spelare baserat på närvaro</CardDescription>
        </CardHeader>
        <CardContent>
          <PlayerAttendanceAnalytics players={players} activities={activities} />
        </CardContent>
      </Card>
    </div>
  );
}


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
  // Calculate player activity data
  const playerActivityData = React.useMemo(() => {
    return players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .map(player => {
        const activityCount = player.activities?.length || 0;
        
        return {
          id: player.id,
          name: player.name,
          grade: player.grade,
          activities: activityCount,
          fill: getGradeColor(player.grade)
        };
      })
      .sort((a, b) => b.activities - a.activities)
      .slice(0, 10); // Top 10 players
  }, [players]);

  // Calculate grade statistics
  const gradeStats = React.useMemo(() => {
    return calculateGradeStats(players);
  }, [players]);

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

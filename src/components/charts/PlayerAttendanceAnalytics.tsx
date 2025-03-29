
import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Player, Activity } from "@/types/player";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { getGradeColor } from '@/utils/gradeUtils';

interface PlayerAttendanceAnalyticsProps {
  players: Player[];
  activities: Activity[];
}

export function PlayerAttendanceAnalytics({ players, activities }: PlayerAttendanceAnalyticsProps) {
  // Calculate attendance rates for each player
  const attendanceData = useMemo(() => {
    return players
      .filter(player => !player.positions?.includes('TRÄNARE')) // Filter out trainers
      .map(player => {
        // Count activities the player is participating in
        const participatingCount = player.activities?.length || 0;
        
        // Calculate attendance percentage
        const attendanceRate = activities.length > 0 
          ? (participatingCount / activities.length) * 100 
          : 0;
        
        return {
          name: player.name,
          grade: player.grade,
          jersey: player.jerseyNumber || '',
          attendanceRate: Math.round(attendanceRate),
          activitiesCount: participatingCount,
          totalActivities: activities.length
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate) // Sort by attendance rate
      .slice(0, 10); // Get top 10 players
  }, [players, activities]);

  const chartConfig = {
    gradeA: { theme: { light: getGradeColor('A'), dark: getGradeColor('A') } },
    gradeB: { theme: { light: getGradeColor('B'), dark: getGradeColor('B') } },
    gradeC: { theme: { light: getGradeColor('C'), dark: getGradeColor('C') } },
    gradeD: { theme: { light: getGradeColor('D'), dark: getGradeColor('D') } },
  };

  // Format data for the fill colors based on grade
  const formatData = attendanceData.map(item => ({
    ...item,
    fill: getGradeColor(item.grade)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Närvaro Analys</CardTitle>
        <CardDescription>Top 10 spelare baserat på närvaro</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] mt-2">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={formatData}
                layout="vertical"
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={120}
                  tickFormatter={(value) => {
                    // Truncate long names
                    return value.length > 15 ? value.substring(0, 15) + '...' : value;
                  }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{data.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Nivå: {data.grade} {data.jersey ? `• #${data.jersey}` : ''}
                          </div>
                          <div className="mt-1 font-medium text-sm">
                            Närvaro: {data.attendanceRate}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {data.activitiesCount} av {data.totalActivities} aktiviteter
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="attendanceRate" 
                  name="" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

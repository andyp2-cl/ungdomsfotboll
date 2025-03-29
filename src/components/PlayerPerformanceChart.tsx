
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Player, Activity } from "@/types/player";
import { Calendar, Users } from "lucide-react";
import { getGradeColor } from '@/utils/gradeUtils';

interface PlayerPerformanceChartProps {
  players: Player[];
  activities: Activity[];
}

export function PlayerPerformanceChart({ players, activities }: PlayerPerformanceChartProps) {
  const performanceData = useMemo(() => {
    // Create a map of player performance
    const playerPerformance = players
      .filter(player => !player.positions?.includes('TRÄNARE'))
      .map(player => {
        // Calculate player's activity participation rate
        const participationCount = player.activities?.length || 0;
        const participationRate = activities.length > 0 
          ? Math.round((participationCount / activities.length) * 100) 
          : 0;
        
        // Calculate activity participation over time
        // For simplicity, let's just track their activity count
        
        return {
          id: player.id,
          name: player.name,
          grade: player.grade,
          position: player.positions?.[0] || 'N/A',
          jerseyNumber: player.jerseyNumber || '',
          activityCount: participationCount,
          participationRate: participationRate,
          fill: getGradeColor(player.grade)
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("Player performance data:", playerPerformance); // Log for debugging
    return playerPerformance;
  }, [players, activities]);

  // Group by position
  const positionData = useMemo(() => {
    const positions = new Map<string, { position: string, count: number, participationAvg: number }>();
    
    performanceData.forEach(player => {
      const pos = player.position;
      const current = positions.get(pos) || { position: pos, count: 0, participationAvg: 0 };
      current.count += 1;
      current.participationAvg += player.participationRate;
      positions.set(pos, current);
    });
    
    // Calculate averages
    return Array.from(positions.values()).map(data => ({
      ...data,
      participationAvg: data.count > 0 ? Math.round(data.participationAvg / data.count) : 0
    }));
  }, [performanceData]);

  return (
    <Card className="col-span-1 md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Prestationsanalys
        </CardTitle>
        <CardDescription>
          Spelarnärvaro fördelat på position
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={positionData}
              margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="position" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[0, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="font-medium">{data.position}</div>
                        <div className="text-sm">
                          Genomsnittlig närvaro: {data.participationAvg}%
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Antal spelare: {data.count}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="participationAvg" 
                name="Genomsnittlig närvaro" 
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart3, Users } from "lucide-react";

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

  // Get grade color
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#22c55e'; // green-500
      case 'B': return '#3b82f6'; // blue-500
      case 'C': return '#f97316'; // orange-500
      case 'D': return '#a855f7'; // purple-500
      default: return '#6b7280'; // gray-500
    }
  };

  // Config for the charts - fixed to match ChartConfig type
  const chartConfig = {
    gradeA: { theme: { light: '#22c55e', dark: '#22c55e' } },
    gradeB: { theme: { light: '#3b82f6', dark: '#3b82f6' } },
    gradeC: { theme: { light: '#f97316', dark: '#f97316' } },
    gradeD: { theme: { light: '#a855f7', dark: '#a855f7' } },
  };

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
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={playerStats.slice(0, 10)} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={70} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                              <p className="font-semibold">{data.name}</p>
                              <p>Nivå: {data.grade}</p>
                              <p>Aktiviteter: {data.activities}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar dataKey="activities" name="">
                      {playerStats.slice(0, 10).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getGradeColor(entry.grade)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
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
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeStats} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="grade" />
                    <YAxis />
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-2 shadow-md">
                              <p className="font-semibold">Nivå {data.grade}</p>
                              <p>Antal spelare: {data.players}</p>
                              <p>Totalt antal aktiviteter: {data.count}</p>
                              <p>Genomsnitt per spelare: {data.average}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="average" 
                      name="Genomsnitt"
                    >
                      {gradeStats.map((entry) => (
                        <Cell key={`cell-${entry.grade}`} fill={getGradeColor(entry.grade)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Player Count Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Spelarsammanfattning
            </CardTitle>
            <CardDescription>Översikt av spelarfördelning</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {gradeStats.map(stat => (
                <div 
                  key={stat.grade} 
                  className="flex flex-col items-center justify-center p-4 border rounded-lg"
                  style={{ borderColor: getGradeColor(stat.grade), borderWidth: '2px' }}
                >
                  <span className="text-2xl font-bold">{stat.players}</span>
                  <span className="text-sm text-muted-foreground">Nivå {stat.grade}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

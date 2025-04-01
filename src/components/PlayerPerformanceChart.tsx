
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { Player, Activity } from "@/types/player";
import { Calendar, Users, Award, Trophy } from "lucide-react";
import { getGradeColor } from '@/utils/gradeUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PlayerPerformanceChartProps {
  players: Player[];
  activities: Activity[];
}

export function PlayerPerformanceChart({ players, activities }: PlayerPerformanceChartProps) {
  const [activeTab, setActiveTab] = useState<"position" | "goals" | "wins">("position");

  // Sort activities by date
  const sortedActivities = useMemo(() => {
    return [...activities].sort((a, b) => {
      // Sort by date first
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      
      // If dates are the same, sort by time if available
      if (dateComparison === 0 && a.time && b.time) {
        return a.time.localeCompare(b.time);
      }
      
      return dateComparison;
    });
  }, [activities]);

  const performanceData = useMemo(() => {
    // Create a map of player performance
    const playerPerformance = players
      .filter(player => !player.positions?.includes('TRÄNARE'))
      .map(player => {
        // Calculate player's activity participation rate
        const participationCount = player.activities?.length || 0;
        const participationRate = sortedActivities.length > 0 
          ? Math.round((participationCount / sortedActivities.length) * 100) 
          : 0;
        
        // Calculate goals, assists, and win statistics
        let totalGoals = 0;
        let totalAssists = 0;
        let matchCount = 0;
        let winCount = 0;
        let goalMatches = 0; // Number of matches where player scored

        activities.forEach(activity => {
          if (activity.type === "match" && activity.participants?.includes(player.id)) {
            matchCount++;
            
            // Count goals and assists
            if (activity.playerStats) {
              const goals = activity.playerStats.goals?.[player.id] || 0;
              const assists = activity.playerStats.assists?.[player.id] || 0;
              totalGoals += goals;
              totalAssists += assists;
              
              if (goals > 0) {
                goalMatches++;
              }
            }
            
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

        const goalsAvg = matchCount > 0 ? (totalGoals / matchCount).toFixed(2) : '0';
        const assistsAvg = matchCount > 0 ? (totalAssists / matchCount).toFixed(2) : '0';
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
          goalsAvg: parseFloat(goalsAvg),
          assistsAvg: parseFloat(assistsAvg),
          totalGoals,
          totalAssists,
          matchCount,
          winCount,
          winRate,
          goalRate,
          fill: getGradeColor(player.grade),
          activities: player.activities || []
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return playerPerformance;
  }, [players, sortedActivities, activities]);

  // Group by position
  const positionData = useMemo(() => {
    const positions = new Map<string, { position: string, count: number, participationAvg: number, goalsAvg: number, assistsAvg: number, winRate: number }>();
    
    performanceData.forEach(player => {
      const pos = player.position;
      const current = positions.get(pos) || { position: pos, count: 0, participationAvg: 0, goalsAvg: 0, assistsAvg: 0, winRate: 0 };
      current.count += 1;
      current.participationAvg += player.participationRate;
      current.goalsAvg += player.goalsAvg;
      current.assistsAvg += player.assistsAvg;
      current.winRate += player.winRate;
      positions.set(pos, current);
    });
    
    // Calculate averages
    return Array.from(positions.values()).map(data => ({
      ...data,
      participationAvg: data.count > 0 ? Math.round(data.participationAvg / data.count) : 0,
      goalsAvg: data.count > 0 ? Number((data.goalsAvg / data.count).toFixed(2)) : 0,
      assistsAvg: data.count > 0 ? Number((data.assistsAvg / data.count).toFixed(2)) : 0,
      winRate: data.count > 0 ? Math.round(data.winRate / data.count) : 0,
    }));
  }, [performanceData]);

  // Top goal scorers
  const topScorers = useMemo(() => {
    return [...performanceData]
      .filter(player => player.totalGoals > 0)
      .sort((a, b) => b.totalGoals - a.totalGoals)
      .slice(0, 10);
  }, [performanceData]);

  // Win rate data
  const winRateData = useMemo(() => {
    return [...performanceData]
      .filter(player => player.matchCount >= 3) // Only include players with at least 3 matches
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 10);
  }, [performanceData]);

  // Team Summary Data for Pie Charts
  const teamSummary = useMemo(() => {
    // Total goals by position
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
  }, [performanceData]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <Card className="col-span-1 md:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Prestationsanalys
        </CardTitle>
        <CardDescription>
          Spelares prestationer i matcher
        </CardDescription>
        <TabsList className="mt-2">
          <TabsTrigger 
            value="position" 
            onClick={() => setActiveTab("position")}
            className={activeTab === "position" ? "bg-primary text-primary-foreground" : ""}
          >
            Position
          </TabsTrigger>
          <TabsTrigger 
            value="goals" 
            onClick={() => setActiveTab("goals")}
            className={activeTab === "goals" ? "bg-primary text-primary-foreground" : ""}
          >
            Mål & Assist
          </TabsTrigger>
          <TabsTrigger 
            value="wins" 
            onClick={() => setActiveTab("wins")}
            className={activeTab === "wins" ? "bg-primary text-primary-foreground" : ""}
          >
            Vinststatistik
          </TabsTrigger>
        </TabsList>
      </CardHeader>
      <CardContent>
        {activeTab === "position" && (
          <div className="h-[350px]">
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
                          <div className="text-xs text-green-600">
                            Mål per match: {data.goalsAvg.toFixed(1)}
                          </div>
                          <div className="text-xs text-blue-600">
                            Assist per match: {data.assistsAvg.toFixed(1)}
                          </div>
                          <div className="text-xs text-amber-600">
                            Vinstprocent: {data.winRate}%
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
        )}
        
        {activeTab === "goals" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-[350px]">
              <h3 className="text-lg font-medium mb-2">Toppmålskyttar</h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={topScorers}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 12 }} 
                    width={100}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const player = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm">Mål: {player.totalGoals}</div>
                            <div className="text-sm">Assist: {player.totalAssists}</div>
                            <div className="text-xs text-muted-foreground">
                              Mål per match: {player.goalsAvg.toFixed(2)}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="totalGoals" 
                    fill="#22c55e"
                    radius={[0, 4, 4, 0]}
                  >
                    {topScorers.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="h-[350px]">
              <h3 className="text-lg font-medium mb-2">Målfördelning per position</h3>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={teamSummary.goalData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {teamSummary.goalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-2 shadow-sm">
                            <div className="font-medium">{data.name}</div>
                            <div className="text-sm">Mål: {data.value}</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {activeTab === "wins" && (
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={winRateData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis 
                  type="number" 
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tick={{ fontSize: 12 }} 
                  width={100}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const player = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm">Vinstprocent: {player.winRate}%</div>
                          <div className="text-sm">Matcher: {player.matchCount}</div>
                          <div className="text-sm">Vinster: {player.winCount}</div>
                          <div className="text-xs text-muted-foreground">
                            Mål: {player.totalGoals}, Assist: {player.totalAssists}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="winRate" 
                  fill="#f59e0b"
                  radius={[0, 4, 4, 0]}
                >
                  {winRateData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

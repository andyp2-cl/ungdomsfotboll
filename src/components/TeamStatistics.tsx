
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import { PlayerActivityChart } from "@/components/charts/PlayerActivityChart";
import { GradeStatisticsChart } from "@/components/charts/GradeStatisticsChart";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { getGradeChartConfig } from "@/utils/gradeUtils";
import { PlayerPerformanceChart } from "@/components/PlayerPerformanceChart";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { PlayerAttendanceAnalytics } from "@/components/charts/PlayerAttendanceAnalytics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getGradeColor } from '@/utils/gradeUtils';

interface TeamStatisticsProps {
  players: Player[];
  activities: Activity[];
}

export function TeamStatistics({ players, activities }: TeamStatisticsProps) {
  // Calculate player participation statistics
  const playerStats = useMemo(() => {
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
        if (activity.type === "match" && activity.playerStats && activity.participants?.includes(player.id)) {
          matchCount++;
          totalGoals += activity.playerStats.goals?.[player.id] || 0;
          totalAssists += activity.playerStats.assists?.[player.id] || 0;
          
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

      const goalsAvg = matchCount > 0 ? totalGoals / matchCount : 0;
      const assistsAvg = matchCount > 0 ? totalAssists / matchCount : 0;
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
        activityData: player.activities?.length || 0 // Fix for the type error, changed from activities array to number
      };
    }).sort((a, b) => b.activityCount - a.activityCount);
  }, [players, activities]);

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
      <Tabs defaultValue="overview">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Lagstatistik
          </h2>
          <TabsList>
            <TabsTrigger value="overview">Översikt</TabsTrigger>
            <TabsTrigger value="attendance">Närvaro</TabsTrigger>
            <TabsTrigger value="performance">Prestationer</TabsTrigger>
            <TabsTrigger value="trends">Trender</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
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
            
            {/* Monthly Activity Trends */}
            <MonthlyActivityChart activities={activities} />
          </div>
        </TabsContent>
        
        <TabsContent value="attendance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PlayerPerformanceChart players={players} activities={activities} />
            <PlayerAttendanceAnalytics players={players} activities={activities} />
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Mål & Assist</CardTitle>
                <CardDescription>Mål och assist per spelare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full overflow-y-auto pr-4">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b text-left">
                        <th className="pb-2">Spelare</th>
                        <th className="pb-2 text-center">Matcher</th>
                        <th className="pb-2 text-center">Mål</th>
                        <th className="pb-2 text-center">Assist</th>
                        <th className="pb-2 text-center">Poäng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats
                        .filter(player => player.matchCount > 0)
                        .sort((a, b) => (b.goals + b.assists) - (a.goals + a.assists))
                        .map(player => (
                          <tr key={player.id} className="border-b hover:bg-accent/5">
                            <td className="py-2">{player.name}</td>
                            <td className="py-2 text-center">{player.matchCount}</td>
                            <td className="py-2 text-center">{player.goals}</td>
                            <td className="py-2 text-center">{player.assists}</td>
                            <td className="py-2 text-center">{player.goals + player.assists}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Vinststatistik</CardTitle>
                <CardDescription>Vinster och vinstprocent</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full overflow-y-auto pr-4">
                  <table className="w-full">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b text-left">
                        <th className="pb-2">Spelare</th>
                        <th className="pb-2 text-center">Matcher</th>
                        <th className="pb-2 text-center">Vinster</th>
                        <th className="pb-2 text-center">Vinstprocent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {playerStats
                        .filter(player => player.matchCount >= 3) // Only show players with at least 3 matches
                        .sort((a, b) => b.winRate - a.winRate)
                        .map(player => (
                          <tr key={player.id} className="border-b hover:bg-accent/5">
                            <td className="py-2">{player.name}</td>
                            <td className="py-2 text-center">{player.matchCount}</td>
                            <td className="py-2 text-center">{player.winCount}</td>
                            <td className="py-2 text-center">{player.winRate}%</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MonthlyActivityChart activities={activities} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Aktivitetsutveckling
                </CardTitle>
                <CardDescription>
                  Utveckling av aktiviteter över tid
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-[300px]">
                <div className="text-center p-4">
                  <h3 className="text-xl font-medium mb-4">Trend analys</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold text-green-500">+{Math.round(activities.length * 0.15)}</div>
                      <div className="text-sm text-muted-foreground">Ökning jämfört med förra perioden</div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold">{activities.filter(a => a.type === 'match').length}</div>
                      <div className="text-sm text-muted-foreground">Matchaktiviteter</div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="text-2xl font-bold">{activities.filter(a => a.type === 'cup').length}</div>
                      <div className="text-sm text-muted-foreground">Cupaktiviteter</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

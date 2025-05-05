
import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";

interface OverviewTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function OverviewTabContent({ players, activities, onPlayerSelect }: OverviewTabContentProps) {
  // Calculate grade statistics for PlayerSummaryCard
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

  // Fetch league data
  const { data: leagues = [] } = useQuery({
    queryKey: ["leagues-summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false });
        
      if (error) {
        console.error("Error fetching leagues:", error);
        return [];
      }
      
      return data;
    },
  });

  // Prepare league match statistics
  const leagueMatchStats = useMemo(() => {
    // Group leagues by year
    const leaguesByYear: Record<number, any[]> = {};
    
    leagues.forEach(league => {
      if (!leaguesByYear[league.year]) {
        leaguesByYear[league.year] = [];
      }
      
      const leagueMatches = activities.filter(
        activity => activity.type === "match" && activity.league_id === league.id
      );
      
      let wins = 0;
      let draws = 0;
      let losses = 0;
      
      leagueMatches.forEach(match => {
        if (match.homeScore !== undefined && match.awayScore !== undefined && 
            match.homeScore === match.awayScore) {
          draws++;
        } else if (match.isWin === true) {
          wins++;
        } else if (match.isWin === false) {
          losses++;
        }
      });
      
      leaguesByYear[league.year].push({
        ...league,
        matches: leagueMatches.length,
        wins,
        draws,
        losses,
        name: `${league.year} ${league.name}`
      });
    });
    
    return leaguesByYear;
  }, [leagues, activities]);

  const COLORS = ['#16a34a', '#9F9EA1', '#dc2626'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* League Match Statistics - Current Year */}
      <Card>
        <CardHeader>
          <CardTitle>Ligamatcher</CardTitle>
          <CardDescription>Statistik över matcher i ligor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(leagueMatchStats).length > 0 ? (
              Object.entries(leagueMatchStats)
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .slice(0, 1)
                .map(([year, leagues]) => (
                  <div key={year} className="space-y-6">
                    <h3 className="font-medium text-lg">{year}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {leagues.map(league => (
                        <div key={league.id} className="flex items-center justify-between border-b pb-3">
                          <div>
                            <h4 className="font-medium">{league.name}</h4>
                            <div className="flex items-center space-x-1 mt-1">
                              <Badge variant="success" className="text-xs">V: {league.wins}</Badge>
                              <Badge variant="outline" className="text-xs">O: {league.draws}</Badge>
                              <Badge variant="destructive" className="text-xs">F: {league.losses}</Badge>
                            </div>
                          </div>
                          
                          <div className="w-20 h-20">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Vinster', value: league.wins },
                                    { name: 'Oavgjorda', value: league.draws },
                                    { name: 'Förluster', value: league.losses }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={15}
                                  outerRadius={35}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {[0, 1, 2].map((index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value) => [`${value} st`]}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Inga ligamatcher hittade
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical League Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Ligahistorik</CardTitle>
          <CardDescription>Tidigare års ligamatcher</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(leagueMatchStats).length > 1 ? (
              Object.entries(leagueMatchStats)
                .sort(([yearA], [yearB]) => Number(yearB) - Number(yearA))
                .slice(1, 3)
                .map(([year, leagues]) => (
                  <div key={year} className="space-y-3">
                    <h3 className="font-medium">{year}</h3>
                    <div className="space-y-2">
                      {leagues.map(league => (
                        <div key={league.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h4 className="text-sm font-medium">{league.name}</h4>
                            <div className="flex items-center space-x-1 mt-0.5">
                              <span className="text-xs text-green-600 font-medium">{league.wins}V</span>
                              <span className="text-xs text-gray-500">-</span>
                              <span className="text-xs text-amber-600 font-medium">{league.draws}O</span>
                              <span className="text-xs text-gray-500">-</span>
                              <span className="text-xs text-red-600 font-medium">{league.losses}F</span>
                            </div>
                          </div>
                          
                          <div className="w-12 h-12">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: 'Vinster', value: league.wins },
                                    { name: 'Oavgjorda', value: league.draws },
                                    { name: 'Förluster', value: league.losses }
                                  ]}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={10}
                                  outerRadius={20}
                                  paddingAngle={1}
                                  dataKey="value"
                                >
                                  {[0, 1, 2].map((index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Ingen historik tillgänglig
              </div>
            )}
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

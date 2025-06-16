import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerSummaryCard } from "@/components/charts/PlayerSummaryCard";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Badge } from "@/components/ui/badge";
import { MatchStatsCard } from "../matches/MatchStatsCard";

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

  // Filter match activities
  const matchActivities = activities.filter(activity => 
    activity.type === "match" && new Date(activity.date) <= new Date()
  );

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
      
      return data.map(league => {
        // Fix duplicate year in league name
        let cleanName = league.name;
        const yearStr = league.year.toString();
        
        // Remove year prefix if it duplicates the year
        if (cleanName.startsWith(yearStr)) {
          cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
          cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+`), '');
        }
        
        return {
          ...league,
          name: cleanName
        };
      });
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
        displayName: league.name
      });
    });
    
    return leaguesByYear;
  }, [leagues, activities]);

  const COLORS = ['#16a34a', '#9F9EA1', '#dc2626'];

  // Function to sort leagues by priority with the specific order requested
  const sortLeagues = (leagues: any[]) => {
    return [...leagues].sort((a, b) => {
      // First sort by year (descending)
      if (a.year !== b.year) {
        return b.year - a.year;
      }
      
      // Custom sort for division A, A2, A1, B1, etc.
      const aDivisionLetter = a.name.charAt(0);
      const bDivisionLetter = b.name.charAt(0);
      
      // If division letters are different, sort alphabetically (A before B)
      if (aDivisionLetter !== bDivisionLetter) {
        return aDivisionLetter.localeCompare(bDivisionLetter);
      }
      
      // If both are A division, handle A, A1, A2 special case
      if (aDivisionLetter === 'A') {
        // Plain "A" always comes first
        if (a.name === 'A' && b.name !== 'A') return -1;
        if (b.name === 'A' && a.name !== 'A') return 1;
        
        // For A1, A2, etc., sort by the number (A2 before A1)
        const aNumber = parseInt(a.name.substring(1), 10) || 0;
        const bNumber = parseInt(b.name.substring(1), 10) || 0;
        
        // Special case: A2 should come before A1
        if (aNumber === 2 && bNumber === 1) return -1;
        if (aNumber === 1 && bNumber === 2) return 1;
        
        return aNumber - bNumber;
      }
      
      // For other divisions, sort normally
      return a.name.localeCompare(b.name);
    });
  };

  // All leagues, sorted by year
  const allLeagues = useMemo(() => {
    const allSortedLeagues: any[] = [];
    
    // First add all leagues from the current year
    const years = Object.keys(leagueMatchStats).sort((a, b) => Number(b) - Number(a));
    
    years.forEach(year => {
      const yearLeagues = leagueMatchStats[Number(year)] || [];
      const sortedYearLeagues = sortLeagues(yearLeagues);
      
      if (sortedYearLeagues.length > 0) {
        allSortedLeagues.push({
          year: Number(year),
          leagues: sortedYearLeagues,
          isCurrent: year === years[0]
        });
      }
    });
    
    return allSortedLeagues;
  }, [leagueMatchStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Match Statistics Card */}
      <MatchStatsCard 
        activities={matchActivities} 
        className="col-span-full md:col-span-1"
      />

      {/* League Match Statistics - All leagues in one card */}
      <Card>
        <CardHeader>
          <CardTitle>Ligamatcher</CardTitle>
          <CardDescription>Statistik över alla ligor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {allLeagues.length > 0 ? (
              allLeagues.map(yearData => (
                <div key={yearData.year} className="space-y-4">
                  <h3 className="font-medium text-lg border-b pb-1">{yearData.year}</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {yearData.leagues.map(league => (
                      <div key={league.id} className="flex items-center justify-between border-b pb-3">
                        <div>
                          <h4 className="font-medium">{yearData.year} {league.displayName}</h4>
                          <div className="flex items-center space-x-1 mt-1">
                            <Badge variant="success" className="text-xs">V: {league.wins}</Badge>
                            <Badge variant="outline" className="text-xs">O: {league.draws}</Badge>
                            <Badge variant="destructive" className="text-xs">F: {league.losses}</Badge>
                          </div>
                        </div>
                        
                        <div className="w-16 h-16">
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
                                outerRadius={30}
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
    </div>
  );
}

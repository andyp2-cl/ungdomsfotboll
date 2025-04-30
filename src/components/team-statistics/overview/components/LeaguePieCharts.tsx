
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Trophy } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeagueWithMatches extends League {
  matches: Activity[];
  wins: number;
  draws: number;
  losses: number;
}

interface LeaguePieChartsProps {
  activities: Activity[];
  players: Player[];
  onPlayerClick?: (playerId: string) => void;
}

export function LeaguePieCharts({ activities, players, onPlayerClick }: LeaguePieChartsProps) {
  // Colors matching badges: green for wins, amber for draws, red for losses
  const COLORS = ['#16a34a', '#f59e0b', '#dc2626'];
  
  // Chart configuration
  const chartConfig = {
    wins: {
      label: "Vinster",
      color: "#16a34a"
    },
    draws: {
      label: "Oavgjorda",
      color: "#f59e0b"
    },
    losses: {
      label: "Förluster",
      color: "#dc2626"
    }
  };

  // Fetch leagues data
  const { data: leaguesWithMatches = [], isLoading } = useQuery({
    queryKey: ["leagues-with-matches-piechart", activities.length],
    queryFn: async () => {
      const { data: leagues, error } = await supabase
        .from("leagues")
        .select("*")
        .order("year", { ascending: false })
        .order("name");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        throw error;
      }
      
      return (leagues || []).map((league: League) => {
        const leagueMatches = activities.filter(
          activity => String(activity.type) === "match" && activity.league_id === league.id
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
        
        return {
          ...league,
          matches: leagueMatches,
          wins,
          draws,
          losses
        };
      }).filter((league: LeagueWithMatches) => {
        // Only include leagues that have matches
        return league.matches.length > 0;
      }).slice(0, 4); // Limit to top 4 leagues for the overview display
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Laddar ligastatistik...</p>
        </CardContent>
      </Card>
    );
  }
  
  if (!leaguesWithMatches.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Inga ligor med matcher hittades</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Ligafördelning
        </CardTitle>
        <CardDescription>Resultat i ligor</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leaguesWithMatches.map((league) => {
            const totalMatches = league.wins + league.draws + league.losses;
            
            // Skip leagues without matches
            if (totalMatches === 0) return null;
            
            const data = [
              { name: 'Vinster', value: league.wins },
              { name: 'Oavgjorda', value: league.draws },
              { name: 'Förluster', value: league.losses }
            ].filter(item => item.value > 0); // Only show segments with values > 0
            
            return (
              <div key={league.id} className="flex flex-col items-center">
                <p className="font-medium text-sm mb-2">{league.name}</p>
                <div className="h-[120px] w-full">
                  <ChartContainer config={chartConfig} className="h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data}
                          cx="50%"
                          cy="50%"
                          innerRadius={30}
                          outerRadius={50}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value} matcher`, '']}
                        />
                        <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

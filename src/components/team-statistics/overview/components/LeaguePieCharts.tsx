
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Trophy } from "lucide-react";
import { ChartContainer } from "@/components/ui/chart";

interface LeagueData {
  id: string;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

interface LeaguePieChartsProps {
  leagues: LeagueData[];
  isLoading: boolean;
}

export function LeaguePieCharts({ leagues, isLoading }: LeaguePieChartsProps) {
  // Skip rendering if loading or no leagues
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Ligastatistik
          </CardTitle>
          <CardDescription>Fördelning av resultat per liga</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[280px]">
          <div className="text-center text-muted-foreground">Laddar ligastatistik...</div>
        </CardContent>
      </Card>
    );
  }

  if (leagues.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Ligastatistik
          </CardTitle>
          <CardDescription>Fördelning av resultat per liga</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-[280px]">
          <div className="text-center text-muted-foreground">Inga ligor hittades</div>
        </CardContent>
      </Card>
    );
  }

  // Define colors for the pie slices
  const COLORS = ['#16a34a', '#f59e0b', '#dc2626'];
  
  // Define chart configuration
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

  // Get data for active leagues with recent matches
  const activeLeagues = leagues
    .filter(league => (league.wins + league.draws + league.losses) > 0)
    .slice(0, 4); // Limit to 4 leagues for better display

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Ligastatistik
        </CardTitle>
        <CardDescription>Fördelning av resultat per liga</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[280px]">
          {activeLeagues.map(league => (
            <div key={league.id} className="flex flex-col items-center">
              <h4 className="font-semibold text-center mb-1">{league.name}</h4>
              
              <div className="text-xs text-muted-foreground mb-2 flex gap-2 items-center">
                <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-800">V: {league.wins}</span>
                <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">O: {league.draws}</span>
                <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-800">F: {league.losses}</span>
              </div>
              
              <div className="h-24 w-full">
                <ChartContainer config={chartConfig}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Vinster", value: league.wins, color: "#16a34a" },
                          { name: "Oavgjorda", value: league.draws, color: "#f59e0b" },
                          { name: "Förluster", value: league.losses, color: "#dc2626" }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={40}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {[
                          { name: "Vinster", value: league.wins, color: "#16a34a" },
                          { name: "Oavgjorda", value: league.draws, color: "#f59e0b" },
                          { name: "Förluster", value: league.losses, color: "#dc2626" }
                        ].filter(item => item.value > 0).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [`${value} matcher`, name]}
                        contentStyle={{ borderRadius: "0.375rem" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

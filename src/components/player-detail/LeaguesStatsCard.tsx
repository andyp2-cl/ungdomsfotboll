
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface LeagueInfo {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
  className?: string;
}

export function LeaguesStatsCard({ player, activities, className }: LeaguesStatsCardProps) {
  // Fetch all leagues to get their names
  const { data: leaguesInfo = [] } = useQuery({
    queryKey: ["leagues-info"],
    queryFn: async (): Promise<LeagueInfo[]> => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*");
      
      if (error) {
        console.error("Error fetching leagues info:", error);
        return [];
      }
      
      return data || [];
    },
  });

  const getLeagueMatches = (leagueId: string) => {
    return activities.filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" &&
      (activity.leagueId === leagueId || activity.league_id === leagueId)
    ).length;
  };

  // Get unique league IDs for this player
  const leagueIds = activities
    .filter(activity => 
      activity.participants?.includes(player.id) && 
      activity.type === "match" && 
      (activity.leagueId || activity.league_id)
    )
    .map(activity => activity.leagueId || activity.league_id)
    .filter((value, index, self) => value && self.indexOf(value) === index);

  // Get league name from the ID using the fetched leagues info
  const getLeagueName = (leagueId: string): string => {
    const league = leaguesInfo.find(l => l.id === leagueId);
    if (league) {
      // Format the league name properly without year duplication
      const yearStr = league.year.toString();
      let cleanName = league.name;
      
      // Remove year prefix if it duplicates the year
      if (cleanName.startsWith(yearStr)) {
        cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+${yearStr}\\s+`), '');
        cleanName = cleanName.replace(new RegExp(`^${yearStr}\\s+`), '');
      }
      
      return `${league.year} ${cleanName}`;
    }
    return `Liga ${leagueIds.indexOf(leagueId) + 1}`;
  };

  // Prepare data for pie chart
  const leagueData = leagueIds.map(leagueId => ({
    leagueId,
    value: getLeagueMatches(leagueId!),
    name: getLeagueName(leagueId!)
  }));

  // Colors for the pie chart segments - using a more visually appealing palette
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  // Render pie chart if we have data
  const renderPieChart = () => {
    if (leagueData.length === 0) return null;
    
    return (
      <div className="h-24 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={leagueData}
              cx="50%"
              cy="50%"
              innerRadius={20}
              outerRadius={40}
              paddingAngle={2}
              dataKey="value"
            >
              {leagueData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className={cn(className)}>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Ligor</CardTitle>
      </CardHeader>
      <CardContent>
        {leagueIds.length > 0 ? (
          <>
            {renderPieChart()}
            <div className="space-y-2 mt-2">
              {leagueIds.map((leagueId, index) => {
                const color = COLORS[index % COLORS.length];
                return (
                  <div key={leagueId || index} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-muted-foreground">
                        {getLeagueName(leagueId!)}:
                      </span>
                    </div>
                    <span className="font-medium">{getLeagueMatches(leagueId!)}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-sm">
            Inga ligamatcher registrerade
          </div>
        )}
      </CardContent>
    </Card>
  );
}

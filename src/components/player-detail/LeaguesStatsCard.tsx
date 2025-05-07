
import React from 'react';
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
}

export function LeaguesStatsCard({ player, activities }: LeaguesStatsCardProps) {
  // Fetch all leagues for proper naming
  const { data: leagues = [] } = useQuery({
    queryKey: ["all-leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*");
        
      if (error) {
        console.error("Error fetching leagues:", error);
        return [];
      }
      
      return data;
    }
  });
  
  // Format league names to match the requested format
  const getFormattedLeagueName = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId);
    if (!league) return "Unknown League";
    
    // Format according to specified requirements: 2013 A, 2014 A1, 2014 A2, 2014 B2
    // Fix the duplicate year issue
    return `${league.year} ${league.name.replace(`${league.year} `, '')}`;
  };

  // Filter matches for this player and count by league
  const leagueStats = React.useMemo(() => {
    const playerMatches = activities.filter(
      activity => 
        activity.type === "match" && 
        activity.participants?.includes(player.id) &&
        activity.league_id // Only include matches with a league
    );

    // Count matches by league ID
    const leagueCounts: { [key: string]: number } = {};
    
    playerMatches.forEach(match => {
      if (match.league_id) {
        leagueCounts[match.league_id] = (leagueCounts[match.league_id] || 0) + 1;
      }
    });

    // Transform to array for recharts
    const data = Object.entries(leagueCounts).map(([leagueId, count]) => {
      const formattedName = getFormattedLeagueName(leagueId);
      return {
        id: leagueId,
        name: formattedName,
        value: count,
        leagueName: formattedName
      };
    });

    return data;
  }, [player.id, activities, leagues]);

  if (leagueStats.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ligor</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-32 text-muted-foreground">
          Inga ligamatcher hittade
        </CardContent>
      </Card>
    );
  }

  const COLORS = ['#16a34a', '#2563eb', '#dc2626', '#9F9EA1', '#f59e0b', '#8b5cf6', '#ec4899'];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ligor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={leagueStats}
                cx="50%"
                cy="50%"
                innerRadius={25}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {leagueStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => {
                  const total = leagueStats.reduce((sum, item) => sum + item.value, 0);
                  const percent = (Number(value) / total) * 100;
                  return [`${value} matcher (${percent.toFixed(0)}%)`, props.payload.leagueName];
                }} 
                labelFormatter={() => ''} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {leagueStats.map((stat, index) => (
            <div key={stat.id} className="flex items-center">
              <div 
                className="w-3 h-3 mr-1" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-sm">{stat.leagueName}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

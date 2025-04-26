
import React from 'react';
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

interface League {
  id: string;
  name: string;
  division: string;
  year: number;
}

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
}

export function LeaguesStatsCard({ player, activities }: LeaguesStatsCardProps) {
  // Fetch leagues data
  const { data: leagues = [] } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .order('year', { ascending: false });
        
      if (error) throw error;
      return data as League[];
    },
  });

  // Calculate league statistics
  const leagueStats = React.useMemo(() => {
    const playerMatches = activities.filter(
      activity => 
        activity.type === "match" && 
        activity.participants?.includes(player.id) &&
        activity.league_id
    );

    // Count matches by league ID and associate with league data
    const leagueCounts: { [key: string]: { count: number; league: League | undefined } } = {};
    
    playerMatches.forEach(match => {
      if (match.league_id) {
        if (!leagueCounts[match.league_id]) {
          const league = leagues.find(l => l.id === match.league_id);
          leagueCounts[match.league_id] = {
            count: 1,
            league
          };
        } else {
          leagueCounts[match.league_id].count++;
        }
      }
    });

    // Transform to array for recharts
    const data = Object.entries(leagueCounts)
      .filter(([_, { league }]) => league) // Only include matches with valid league data
      .map(([id, { count, league }]) => ({
        id,
        name: `${league?.year} ${league?.division}`,
        value: count
      }));

    // Calculate percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percent: item.value / total
    }));
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
                  const item = props?.payload;
                  const percentage = item?.percent ? 
                    (item.percent * 100).toFixed(0) : 0;
                  
                  return [`${name}: ${value} matcher (${percentage}%)`, ''];
                }}
                labelFormatter={() => ''} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}


import React from 'react';
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
}

export function LeaguesStatsCard({ player, activities }: LeaguesStatsCardProps) {
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
      // Find a match with this league to get the league name
      const match = activities.find(a => a.league_id === leagueId);
      return {
        name: match?.name || 'Unknown League',
        value: count,
        // Extract the league name from the match name if possible
        // Most league matches have format like "Series [League] HomeTeam - AwayTeam"
        leagueName: match?.name?.split(' ').slice(0, 2).join(' ') || 'Unknown'
      };
    });

    return data;
  }, [player.id, activities]);

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
                label={({ leagueName, value, payload }) => {
                  // Calculate the percentage from the payload data
                  const total = leagueStats.reduce((sum, item) => sum + item.value, 0);
                  const percent = payload && payload.value ? (payload.value / total) * 100 : 0;
                  return `${leagueName}: ${percent.toFixed(0)}%`;
                }}
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
      </CardContent>
    </Card>
  );
}

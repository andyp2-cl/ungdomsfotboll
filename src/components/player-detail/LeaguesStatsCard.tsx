
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

    const leagueCounts: { [key: string]: number } = {};
    
    playerMatches.forEach(match => {
      if (match.league_id) {
        leagueCounts[match.league_id] = (leagueCounts[match.league_id] || 0) + 1;
      }
    });

    const data = Object.entries(leagueCounts).map(([leagueId, count]) => {
      const match = activities.find(a => a.league_id === leagueId);
      return {
        name: match?.name || 'Unknown League',
        value: count
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

  const COLORS = ['#16a34a', '#2563eb', '#dc2626', '#9F9EA1', '#f59e0b'];

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
                label={({ name, value }) => `${name}: ${value}`}
              >
                {leagueStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

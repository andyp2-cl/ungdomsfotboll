
import React from 'react';
import { Activity, Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
}

export function LeaguesStatsCard({ player, activities }: LeaguesStatsCardProps) {
  // Filter matches for this player and count by league level
  const leagueStats = React.useMemo(() => {
    const playerMatches = activities.filter(
      activity => 
        activity.type === "match" && 
        activity.participants?.includes(player.id) &&
        activity.league_id // Only include matches with a league
    );

    // Count matches by league level
    const leagueLevelCounts: { [key: string]: number } = {};
    
    playerMatches.forEach(match => {
      if (match.league_id) {
        // Extract league level from match name (e.g., "2014 A1" from "Series 2014 A1 HomeTeam - AwayTeam")
        const nameParts = match.name.split(' ');
        if (nameParts.length >= 2) {
          const leagueLevel = `${nameParts[1]} ${nameParts[2]}`;
          leagueLevelCounts[leagueLevel] = (leagueLevelCounts[leagueLevel] || 0) + 1;
        }
      }
    });

    // Transform to array for recharts
    const data = Object.entries(leagueLevelCounts).map(([level, count]) => ({
      name: level,
      value: count
    }));

    // Calculate percentages
    const total = data.reduce((sum, item) => sum + item.value, 0);
    return data.map(item => ({
      ...item,
      percent: item.value / total
    }));
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
                  const item = props && props.payload ? props.payload : null;
                  const percentage = item?.payload?.percent ? 
                    (item.payload.percent * 100).toFixed(0) : 0;
                  
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


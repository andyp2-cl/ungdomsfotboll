
import React from "react";
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface LeaguesStatsCardProps {
  player: Player;
  activities: Activity[];
  className?: string;
}

export function LeaguesStatsCard({ player, activities, className }: LeaguesStatsCardProps) {
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

  // Prepare data for pie chart
  const leagueData = leagueIds.map((leagueId, index) => ({
    leagueId,
    value: getLeagueMatches(leagueId!),
    name: `Liga ${index + 1}`
  }));

  // Colors for the pie chart segments
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
              label={({ name, value }) => `${name}: ${value}`}
              labelLine={false}
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
              {leagueIds.map((leagueId, index) => (
                <div key={leagueId || index} className="flex justify-between">
                  <span className="text-muted-foreground">Liga {index + 1}:</span>
                  <span className="font-medium">{getLeagueMatches(leagueId!)}</span>
                </div>
              ))}
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

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player, Activity } from "@/types/player";
import { Trophy, Target, Calendar, TrendingUp, Users } from "lucide-react";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

interface PlayerStatisticsCardProps {
  player: Player;
  activities: Activity[];
}

export function PlayerStatisticsCard({ player, activities }: PlayerStatisticsCardProps) {
  // Calculate comprehensive player statistics
  const playerMatches = activities.filter(activity => 
    activity.type === "match" && 
    activity.participants?.includes(player.id)
  );

  const stats = calculatePlayerStats(player, playerMatches);
  
  // Calculate goals and assists from player_stats
  const totalGoals = playerMatches.reduce((total, activity) => {
    const goals = activity.player_stats?.goals?.[player.id] || 0;
    return total + goals;
  }, 0);

  const totalAssists = playerMatches.reduce((total, activity) => {
    const assists = activity.player_stats?.assists?.[player.id] || 0;
    return total + assists;
  }, 0);

  // Calculate recent form (last 5 matches)
  const recentMatches = playerMatches
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentWins = recentMatches.filter(match => match.isWin === true).length;
  const recentForm = recentMatches.length > 0 ? Math.round((recentWins / recentMatches.length) * 100) : 0;

  // Calculate unique teammates
  const uniqueTeammatesCount = calculateUniqueTeammates(player.id, activities);

  const statisticsData = [
    {
      label: "Matcher spelade",
      value: playerMatches.length,
      icon: Calendar,
      color: "text-blue-600"
    },
    {
      label: "Vinster",
      value: `${stats.wins} (${stats.winRate}%)`,
      icon: Trophy,
      color: "text-green-600"
    },
    {
      label: "Mål",
      value: totalGoals,
      icon: Target,
      color: "text-orange-600"
    },
    {
      label: "Unika medspelare",
      value: uniqueTeammatesCount,
      icon: Users,
      color: "text-purple-600"
    },
    {
      label: "Senaste form",
      value: `${recentForm}%`,
      icon: TrendingUp,
      color: recentForm >= 60 ? "text-green-600" : recentForm >= 40 ? "text-yellow-600" : "text-red-600"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Statistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {statisticsData.map((stat, index) => (
            <div key={index} className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg ${index === 4 ? 'col-span-2' : ''}`}>
              <div className={`p-2 rounded-full bg-white shadow-sm ${stat.color}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-semibold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Goals and Assists breakdown */}
        {(totalGoals > 0 || totalAssists > 0) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Prestationer</h4>
            <div className="flex gap-2">
              {totalGoals > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {totalGoals} mål
                </Badge>
              )}
              {totalAssists > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {totalAssists} assist
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Recent form visualization */}
        {recentMatches.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">Senaste 5 matcher</h4>
            <div className="flex gap-1">
              {recentMatches.map((match, index) => (
                <div
                  key={match.id}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    match.isWin === true 
                      ? 'bg-green-500 text-white' 
                      : match.isWin === false 
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-400 text-white'
                  }`}
                  title={`${match.name} - ${match.isWin === true ? 'Vinst' : match.isWin === false ? 'Förlust' : 'Oavgjort'}`}
                >
                  {match.isWin === true ? 'V' : match.isWin === false ? 'F' : 'O'}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

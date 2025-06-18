
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Player, Activity } from "@/types/player";
import { Trophy, Target, Calendar, TrendingUp, Users, Award } from "lucide-react";
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

  // Calculate goals per match
  const goalsPerMatch = playerMatches.length > 0 ? (totalGoals / playerMatches.length).toFixed(2) : "0.00";

  // Calculate unique teammates
  const uniqueTeammatesCount = calculateUniqueTeammates(player.id, activities);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Statistik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allmän statistik */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Allmän statistik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Antal matcher</span>
                <span className="font-medium">{playerMatches.length}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Vinster</span>
                <span className="font-medium">{stats.wins}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Förluster</span>
                <span className="font-medium">{stats.losses}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Oavgjorda</span>
                <span className="font-medium">{stats.draws}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Unika medspelare</span>
                <span className="font-medium">{uniqueTeammatesCount}</span>
              </div>
            </div>
          </div>
          
          {/* Mål statistik */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Mål statistik
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Totalt mål</span>
                <span className="font-medium">{totalGoals}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Totalt assist</span>
                <span className="font-medium">{totalAssists}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mål per match</span>
                <span className="font-medium">{goalsPerMatch}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Prestationer badges */}
        {(totalGoals > 0 || totalAssists > 0) && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              Prestationer
            </h4>
            <div className="flex gap-2 flex-wrap">
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
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {stats.winRate}% vinst
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

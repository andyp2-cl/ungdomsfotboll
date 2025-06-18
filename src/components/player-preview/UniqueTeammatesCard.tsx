
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Calendar, TrendingUp } from "lucide-react";
import { Activity } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

interface UniqueTeammatesCardProps {
  playerId: string;
  activities: Activity[];
  className?: string;
}

export function UniqueTeammatesCard({ playerId, activities, className = "" }: UniqueTeammatesCardProps) {
  // Get player matches
  const playerMatches = activities.filter(activity => 
    activity.type === "match" && 
    activity.participants?.includes(playerId)
  );

  // Create a dummy player object for stats calculation
  const dummyPlayer = { id: playerId, name: "" };
  const stats = calculatePlayerStats(dummyPlayer, playerMatches);
  
  // Calculate goals and assists from player_stats
  const totalGoals = playerMatches.reduce((total, activity) => {
    const goals = activity.player_stats?.goals?.[playerId] || 0;
    return total + goals;
  }, 0);

  const totalAssists = playerMatches.reduce((total, activity) => {
    const assists = activity.player_stats?.assists?.[playerId] || 0;
    return total + assists;
  }, 0);

  // Calculate goals per match
  const goalsPerMatch = playerMatches.length > 0 ? (totalGoals / playerMatches.length).toFixed(2) : "0.00";

  // Calculate unique teammates
  const uniqueTeammatesCount = calculateUniqueTeammates(playerId, activities);
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-medium">Statistik</CardTitle>
        <Trophy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Allmän statistik */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Allmänt
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Matcher:</span>
              <span className="font-medium">{playerMatches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medspelare:</span>
              <span className="font-medium">{uniqueTeammatesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinster:</span>
              <span className="font-medium text-green-600">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Förluster:</span>
              <span className="font-medium text-red-600">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oavgjorda:</span>
              <span className="font-medium text-yellow-600">{stats.draws}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinst %:</span>
              <span className="font-medium text-blue-600">{stats.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Mål statistik */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Mål & Assist
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål:</span>
              <span className="font-medium text-green-600">{totalGoals}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assist:</span>
              <span className="font-medium text-blue-600">{totalAssists}</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">Mål per match:</span>
              <span className="font-medium">{goalsPerMatch}</span>
            </div>
          </div>
        </div>

        {/* Form (senaste matcherna) */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Senaste form
          </h4>
          <div className="flex gap-1">
            {playerMatches
              .slice(-5)
              .reverse()
              .map((match, index) => {
                let result = "D"; // Draw
                let color = "bg-yellow-500";
                
                if (match.isWin === true) {
                  result = "V";
                  color = "bg-green-500";
                } else if (match.isWin === false) {
                  result = "F";
                  color = "bg-red-500";
                } else if (match.homeScore !== undefined && match.awayScore !== undefined) {
                  if (match.homeScore > match.awayScore) {
                    result = "V";
                    color = "bg-green-500";
                  } else if (match.homeScore < match.awayScore) {
                    result = "F";
                    color = "bg-red-500";
                  }
                }
                
                return (
                  <div
                    key={`${match.id}-${index}`}
                    className={`w-6 h-6 ${color} text-white text-xs flex items-center justify-center rounded-sm font-medium`}
                    title={`${match.name} - ${match.date}`}
                  >
                    {result}
                  </div>
                );
              })}
            {playerMatches.length === 0 && (
              <span className="text-xs text-muted-foreground">Inga matcher än</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

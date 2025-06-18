import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Calendar, TrendingUp, Users, Star } from "lucide-react";
import { Activity } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { Badge } from "@/components/ui/badge";

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

  // Calculate participation rate
  const participationRate = activities.length > 0 
    ? Math.round((playerMatches.length / activities.length) * 100) 
    : 0;

  // Calculate recent form (last 5 matches)
  const recentMatches = [...playerMatches]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const recentWins = recentMatches.filter(match => match.isWin === true).length;
  const recentForm = recentMatches.length > 0 ? Math.round((recentWins / recentMatches.length) * 100) : 0;

  // Calculate points contribution (goals + assists)
  const pointsContribution = totalGoals + totalAssists;
  const pointsPerMatch = playerMatches.length > 0 
    ? (pointsContribution / playerMatches.length).toFixed(2) 
    : "0.00";
  
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-lg font-medium">Statistik</CardTitle>
        <Trophy className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Matcher & Resultat */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Matcher & Resultat
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Matcher:</span>
              <span className="font-medium">{playerMatches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinster:</span>
              <span className="font-medium text-green-600">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oavgjorda:</span>
              <span className="font-medium text-yellow-600">{stats.draws}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Förluster:</span>
              <span className="font-medium text-red-600">{stats.losses}</span>
            </div>
            <div className="flex justify-between border-t pt-2 col-span-2">
              <span className="text-muted-foreground">Vinstprocent:</span>
              <span className="font-medium">{stats.winRate}%</span>
            </div>
          </div>
        </div>

        {/* Målstatistik */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Målstatistik
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
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål/match:</span>
              <span className="font-medium">{goalsPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Poäng/match:</span>
              <span className="font-medium">{pointsPerMatch}</span>
            </div>
            <div className="flex justify-between border-t pt-2 col-span-2">
              <span className="text-muted-foreground">Totala poäng:</span>
              <span className="font-medium">{pointsContribution}</span>
            </div>
          </div>
        </div>

        {/* Övrigt */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Övrigt
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medspelare:</span>
              <span className="font-medium">{uniqueTeammatesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deltagande:</span>
              <span className="font-medium">{participationRate}%</span>
            </div>
            <div className="flex justify-between col-span-2">
              <span className="text-muted-foreground">Form (5 matcher):</span>
              <span className={`font-medium ${
                recentForm >= 60 ? 'text-green-600' : 
                recentForm >= 40 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>{recentForm}%</span>
            </div>
          </div>
        </div>

        {/* Prestationer badges */}
        <div className="border-t pt-4">
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
            {stats.winRate > 0 && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                {stats.winRate}% vinst
              </Badge>
            )}
            {participationRate > 75 && (
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                {participationRate}% deltagande
              </Badge>
            )}
            {uniqueTeammatesCount > 20 && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {uniqueTeammatesCount} medspelare
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

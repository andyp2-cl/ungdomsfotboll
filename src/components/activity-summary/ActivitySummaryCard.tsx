import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, Calendar, TrendingUp, Users, Star } from "lucide-react";
import { Activity, Player } from "@/types/player";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { Badge } from "@/components/ui/badge";

interface ActivitySummaryCardProps {
  activities: Activity[];
  players: Player[];
  className?: string;
}

export function ActivitySummaryCard({ activities, players, className = "" }: ActivitySummaryCardProps) {
  const player = players[0];
  if (!player?.id) return null;

  const playerMatches = activities.filter(activity => 
    activity.type === "match" && 
    activity.participants?.includes(player.id)
  );

  const stats = calculatePlayerStats(player, playerMatches);
  const uniqueTeammatesCount = calculateUniqueTeammates(player.id, activities);

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
  const pointsContribution = (stats.totalGoals || 0) + (stats.totalAssists || 0);
  const goalsPerMatch = playerMatches.length > 0 
    ? ((stats.totalGoals || 0) / playerMatches.length).toFixed(2) 
    : "0.00";
  const pointsPerMatch = playerMatches.length > 0 
    ? (pointsContribution / playerMatches.length).toFixed(2) 
    : "0.00";

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Statistik
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Matcher & Resultat */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Matcher & Resultat
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Matcher:</span>
              <span className="font-medium">{playerMatches.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinster:</span>
              <span className="font-medium text-green-600">{stats.wins}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vinstprocent:</span>
              <span className="font-medium">{stats.winRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Oavgjorda:</span>
              <span className="font-medium text-yellow-600">{stats.draws}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Förluster:</span>
              <span className="font-medium text-red-600">{stats.losses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Form:</span>
              <span className={`font-medium ${
                recentForm >= 60 ? 'text-green-600' : 
                recentForm >= 40 ? 'text-yellow-600' : 
                'text-red-600'
              }`}>{recentForm}%</span>
            </div>
          </div>
        </div>

        {/* Målstatistik */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
            <Target className="h-3 w-3" />
            Målstatistik
          </h3>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål:</span>
              <span className="font-medium text-green-600">{stats.totalGoals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assist:</span>
              <span className="font-medium text-blue-600">{stats.totalAssists || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Totalt:</span>
              <span className="font-medium">{pointsContribution}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mål/match:</span>
              <span className="font-medium">{goalsPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Poäng/match:</span>
              <span className="font-medium">{pointsPerMatch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medspelare:</span>
              <span className="font-medium">{uniqueTeammatesCount}</span>
            </div>
          </div>
        </div>

        {/* Prestationer */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {(stats.totalGoals || 0) > 0 && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
              {stats.totalGoals} mål
            </Badge>
          )}
          {(stats.totalAssists || 0) > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
              {stats.totalAssists} assist
            </Badge>
          )}
          {stats.winRate > 0 && (
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
              {stats.winRate}% vinst
            </Badge>
          )}
          {participationRate > 75 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 text-xs">
              {participationRate}% deltagande
            </Badge>
          )}
          {uniqueTeammatesCount > 20 && (
            <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
              {uniqueTeammatesCount} medspelare
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 

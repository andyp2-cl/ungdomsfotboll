
import React from 'react';
import { Activity } from '@/types/player';
import { PlayerTrainingOverview, MatchConflict } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/formatDate';

interface TeamSelectionOverviewProps {
  upcomingMatches: Activity[];
  playerStats: PlayerTrainingOverview[];
  conflicts: MatchConflict[];
}

export function TeamSelectionOverview({
  upcomingMatches,
  playerStats,
  conflicts
}: TeamSelectionOverviewProps) {
  // Sortera kommande matcher efter datum
  const sortedMatches = upcomingMatches
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5); // Visa bara de 5 närmaste

  // Top 5 spelare med bäst träning/match-ratio
  const topPlayers = playerStats
    .sort((a, b) => b.trainingMatchRatio - a.trainingMatchRatio)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Kommande matcher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kommande matcher</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {sortedMatches.length > 0 ? (
            sortedMatches.map(match => (
              <div key={match.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{match.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(match.date)} {match.time && `• ${match.time}`}
                  </div>
                  {match.location && (
                    <div className="text-xs text-muted-foreground">{match.location.name}</div>
                  )}
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    {match.participants?.length || 0} spelare
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Inga kommande matcher planerade
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top spelare */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bästa träning/match-ratio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPlayers.length > 0 ? (
            topPlayers.map((player, index) => (
              <div key={player.playerId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{player.playerName}</div>
                    <div className="text-sm text-muted-foreground">
                      {player.totalTrainings} träningar • {player.totalMatches} matcher
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {player.trainingMatchRatio.toFixed(1)}
                  </div>
                  {player.averagePerformance && (
                    <div className="text-xs text-muted-foreground">
                      ⭐ {player.averagePerformance.toFixed(1)}/10
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              Ingen träningsdata tillgänglig
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

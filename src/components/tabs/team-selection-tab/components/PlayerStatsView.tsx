
import React, { useState } from 'react';
import { Player } from '@/types/player';
import { PlayerTrainingOverview } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, TrendingUp, Calendar, Award } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';

interface PlayerStatsViewProps {
  playerStats: PlayerTrainingOverview[];
  players: Player[];
}

export function PlayerStatsView({ playerStats, players }: PlayerStatsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'ratio' | 'trainings' | 'matches' | 'performance'>('ratio');

  const filteredAndSortedStats = playerStats
    .filter(stat => 
      stat.playerName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'ratio':
          return b.trainingMatchRatio - a.trainingMatchRatio;
        case 'trainings':
          return b.totalTrainings - a.totalTrainings;
        case 'matches':
          return b.totalMatches - a.totalMatches;
        case 'performance':
          return (b.averagePerformance || 0) - (a.averagePerformance || 0);
        default:
          return 0;
      }
    });

  const getPlayerGrade = (playerId: string) => {
    const player = players.find(p => p.id === playerId);
    return player?.grade || 'Okänt';
  };

  const getRatioColor = (ratio: number) => {
    if (ratio >= 2) return 'text-green-600';
    if (ratio >= 1) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Sök och filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spelarstatistik filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Sök spelare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={sortBy === 'ratio' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('ratio')}
            >
              Träning/Match-ratio
            </Button>
            <Button
              variant={sortBy === 'trainings' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('trainings')}
            >
              Träningar
            </Button>
            <Button
              variant={sortBy === 'matches' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('matches')}
            >
              Matcher
            </Button>
            <Button
              variant={sortBy === 'performance' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSortBy('performance')}
            >
              Prestanda
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spelarstatistik lista */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAndSortedStats.map((stat) => (
          <Card key={stat.playerId} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{stat.playerName}</CardTitle>
                <Badge variant="outline">{getPlayerGrade(stat.playerId)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Träning/Match ratio */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Ratio</span>
                </div>
                <span className={`font-semibold ${getRatioColor(stat.trainingMatchRatio)}`}>
                  {stat.trainingMatchRatio.toFixed(1)}
                </span>
              </div>

              {/* Träningar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Träningar</span>
                </div>
                <span className="font-medium">{stat.totalTrainings}</span>
              </div>

              {/* Matcher */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Matcher</span>
                </div>
                <span className="font-medium">{stat.totalMatches}</span>
              </div>

              {/* Prestanda */}
              {stat.averagePerformance && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Prestanda</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{stat.averagePerformance.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                </div>
              )}

              {/* Senaste träning */}
              {stat.lastTrainingDate && (
                <div className="text-xs text-muted-foreground border-t pt-2">
                  Senaste träning: {formatDate(stat.lastTrainingDate)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAndSortedStats.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchQuery ? 'Inga spelare matchade sökningen' : 'Ingen träningsstatistik tillgänglig'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

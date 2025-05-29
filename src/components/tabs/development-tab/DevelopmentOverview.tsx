
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Activity, PlayerDevelopment } from "@/types/player";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface DevelopmentOverviewProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function DevelopmentOverview({
  players,
  activities,
  onPlayerSelect
}: DevelopmentOverviewProps) {
  // Filter out trainers
  const activePlayers = players.filter(player => 
    !player.positions?.includes("TRÄNARE")
  );

  // Calculate team average development
  const teamAverage = React.useMemo(() => {
    if (activePlayers.length === 0) return null;

    const totals = activePlayers.reduce((acc, player) => {
      if (player.development) {
        acc.technical += player.development.technical;
        acc.gameUnderstanding += player.development.gameUnderstanding;
        acc.passing += player.development.passing;
        acc.offensive += player.development.offensive;
        acc.defensive += player.development.defensive;
        acc.mentality += player.development.mentality;
        acc.count++;
      }
      return acc;
    }, {
      technical: 0,
      gameUnderstanding: 0,
      passing: 0,
      offensive: 0,
      defensive: 0,
      mentality: 0,
      count: 0
    });

    if (totals.count === 0) return null;

    return {
      technical: Math.round((totals.technical / totals.count) * 10) / 10,
      gameUnderstanding: Math.round((totals.gameUnderstanding / totals.count) * 10) / 10,
      passing: Math.round((totals.passing / totals.count) * 10) / 10,
      offensive: Math.round((totals.offensive / totals.count) * 10) / 10,
      defensive: Math.round((totals.defensive / totals.count) * 10) / 10,
      mentality: Math.round((totals.mentality / totals.count) * 10) / 10,
    };
  }, [activePlayers]);

  // Find players with highest and lowest development in each category
  const developmentStats = React.useMemo(() => {
    const categories = ['technical', 'gameUnderstanding', 'passing', 'offensive', 'defensive', 'mentality'];
    const stats: Record<string, { highest: Player | null, lowest: Player | null, average: number }> = {};

    categories.forEach(category => {
      const playersWithData = activePlayers.filter(p => p.development);
      if (playersWithData.length === 0) {
        stats[category] = { highest: null, lowest: null, average: 0 };
        return;
      }

      playersWithData.sort((a, b) => 
        (b.development![category as keyof PlayerDevelopment] || 0) - 
        (a.development![category as keyof PlayerDevelopment] || 0)
      );

      const values = playersWithData.map(p => p.development![category as keyof PlayerDevelopment] || 0);
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      stats[category] = {
        highest: playersWithData[0] || null,
        lowest: playersWithData[playersWithData.length - 1] || null,
        average: Math.round(average * 10) / 10
      };
    });

    return stats;
  }, [activePlayers]);

  const categoryLabels = {
    technical: 'Teknik',
    gameUnderstanding: 'Spelförståelse',
    passing: 'Passningsspel',
    offensive: 'Offensiv',
    defensive: 'Defensiv',
    mentality: 'Mentalitet'
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lag genomsnitt</CardTitle>
          </CardHeader>
          <CardContent>
            {teamAverage ? (
              <DevelopmentChart development={teamAverage} className="h-[200px]" />
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Ingen utvecklingsdata tillgänglig
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utvecklingsstatistik</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between text-sm">
                <span>Aktiva spelare:</span>
                <span className="font-medium">{activePlayers.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Med utvecklingsdata:</span>
                <span className="font-medium">
                  {activePlayers.filter(p => p.development).length}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Totala aktiviteter:</span>
                <span className="font-medium">{activities.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Utveckling per kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(categoryLabels).map(([key, label]) => {
              const stat = developmentStats[key];
              return (
                <div key={key} className="space-y-2 p-3 border rounded-lg">
                  <h4 className="font-medium text-sm">{label}</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Genomsnitt:</span>
                      <span className="font-medium">{stat.average}</span>
                    </div>
                    {stat.highest && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Högst:</span>
                        <button
                          onClick={() => onPlayerSelect?.(stat.highest!.id)}
                          className="font-medium hover:text-primary cursor-pointer"
                        >
                          {stat.highest.name} ({stat.highest.development![key as keyof PlayerDevelopment]})
                        </button>
                      </div>
                    )}
                    {stat.lowest && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lägst:</span>
                        <button
                          onClick={() => onPlayerSelect?.(stat.lowest!.id)}
                          className="font-medium hover:text-primary cursor-pointer"
                        >
                          {stat.lowest.name} ({stat.lowest.development![key as keyof PlayerDevelopment]})
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Toppresultat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {activePlayers
              .filter(p => p.development)
              .sort((a, b) => {
                const aTotal = Object.values(a.development!).reduce((sum, val) => sum + val, 0);
                const bTotal = Object.values(b.development!).reduce((sum, val) => sum + val, 0);
                return bTotal - aTotal;
              })
              .slice(0, 6)
              .map(player => {
                const total = Object.values(player.development!).reduce((sum, val) => sum + val, 0);
                const average = Math.round((total / 6) * 10) / 10;
                
                return (
                  <div
                    key={player.id}
                    className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onPlayerSelect?.(player.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{player.name}</span>
                      <Badge variant="secondary">{average}</Badge>
                    </div>
                    <DevelopmentChart 
                      development={player.development} 
                      className="h-12" 
                      minimal 
                    />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

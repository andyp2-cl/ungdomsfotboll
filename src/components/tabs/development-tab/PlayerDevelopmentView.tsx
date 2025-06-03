
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Player, Activity } from "@/types/player";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { DevelopmentTimeline } from "@/components/development-timeline/DevelopmentTimeline";
import { DevelopmentInsights } from "@/components/development-insights/DevelopmentInsights";
import { DevelopmentComparison } from "@/components/development-tracking/DevelopmentComparison";
import { DevelopmentSummaryCard } from "@/components/development-tracking/DevelopmentSummaryCard";
import { DevelopmentHistoryButton } from "@/components/development-tracking/DevelopmentHistoryButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";
import { TrendingUp, TrendingDown, Calendar, Target, BarChart3, Clock, GitCompare } from "lucide-react";

interface PlayerDevelopmentViewProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function PlayerDevelopmentView({
  players,
  activities,
  onPlayerSelect
}: PlayerDevelopmentViewProps) {
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  
  // Filter out trainers
  const activePlayers = players.filter(player => 
    !player.positions?.includes("TRÄNARE")
  );

  const selectedPlayer = activePlayers.find(p => p.id === selectedPlayerId);
  const { history, isLoading: historyLoading } = useDevelopmentHistory(selectedPlayerId);

  // Get player's activities
  const playerActivities = React.useMemo(() => {
    if (!selectedPlayer) return [];
    return activities
      .filter(activity => activity.participants?.includes(selectedPlayer.id))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedPlayer, activities]);

  // Prepare timeline data from history
  const timelineData = React.useMemo(() => {
    return history.map(entry => ({
      date: entry.recorded_at,
      technical: entry.development_data.technical || 1,
      offensive: entry.development_data.offensive || 1,
      defensive: entry.development_data.defensive || 1,
      mentality: entry.development_data.mentality || 1,
      gameUnderstanding: entry.development_data.gameUnderstanding || 1,
      passing: entry.development_data.passing || 1
    })).reverse(); // Show oldest first for timeline
  }, [history]);

  // Get previous development for insights and comparison
  const previousDevelopment = history.length > 1 ? history[1].development_data : undefined;
  const lastUpdated = history.length > 0 ? history[0].recorded_at : undefined;

  // Calculate development trends
  const developmentTrends = React.useMemo(() => {
    if (!selectedPlayer?.development || history.length < 2) return null;

    const current = selectedPlayer.development;
    const previous = history[1]?.development_data;
    
    if (!previous) return null;

    const categories = ['technical', 'gameUnderstanding', 'passing', 'offensive', 'defensive', 'mentality'];
    const trends: Record<string, 'up' | 'down' | 'stable'> = {};

    categories.forEach(category => {
      const currentValue = current[category as keyof typeof current] || 1;
      const previousValue = previous[category as keyof typeof previous] || 1;
      const diff = currentValue - previousValue;
      
      if (diff > 0.3) trends[category] = 'up';
      else if (diff < -0.3) trends[category] = 'down';
      else trends[category] = 'stable';
    });

    return trends;
  }, [selectedPlayer, history]);

  const categoryLabels = {
    technical: 'Teknik',
    gameUnderstanding: 'Spelförståelse',
    passing: 'Passningsspel',
    offensive: 'Offensiv',
    defensive: 'Defensiv',
    mentality: 'Mentalitet'
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <div className="h-3 w-3 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Välj spelare</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Välj en spelare för att se utveckling" />
            </SelectTrigger>
            <SelectContent>
              {activePlayers.map(player => (
                <SelectItem key={player.id} value={player.id}>
                  <div className="flex items-center gap-2">
                    <span>{player.name}</span>
                    {player.grade && (
                      <Badge variant="outline" className="text-xs">
                        {player.grade}
                      </Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedPlayer && (
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="current" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Nuvarande
            </TabsTrigger>
            <TabsTrigger value="comparison" className="flex items-center gap-2">
              <GitCompare className="h-4 w-4" />
              Jämförelse
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historik
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Insikter
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            {/* Current Development Overview */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedPlayer.name}
                      {selectedPlayer.grade && (
                        <Badge variant="outline">{selectedPlayer.grade}</Badge>
                      )}
                    </div>
                    {selectedPlayer.development && (
                      <DevelopmentHistoryButton
                        playerId={selectedPlayer.id}
                        playerName={selectedPlayer.name}
                        currentDevelopment={selectedPlayer.development}
                        previousDevelopment={previousDevelopment}
                      />
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPlayer.development ? (
                    <DevelopmentChart 
                      development={selectedPlayer.development} 
                      className="h-[350px]" 
                      minimal={true}
                    />
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      Ingen utvecklingsdata tillgänglig för denna spelare
                    </p>
                  )}
                </CardContent>
              </Card>

              <DevelopmentSummaryCard
                playerName={selectedPlayer.name}
                current={selectedPlayer.development}
                previous={previousDevelopment}
                lastUpdated={lastUpdated}
              />
            </div>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aktivitetshistorik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{playerActivities.length}</div>
                    <div className="text-sm text-muted-foreground">Totala aktiviteter</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {playerActivities.filter(a => a.type === 'match').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Matcher</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">
                      {playerActivities.filter(a => a.type === 'cup').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Cuper</div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <div className="text-2xl font-bold">{history.length}</div>
                    <div className="text-sm text-muted-foreground">Utvecklingsposter</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison" className="space-y-4">
            {selectedPlayer.development ? (
              <DevelopmentComparison
                current={selectedPlayer.development}
                previous={previousDevelopment}
                playerName={selectedPlayer.name}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Ingen utvecklingsdata tillgänglig för jämförelse.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {timelineData.length > 1 ? (
              <DevelopmentTimeline
                playerId={selectedPlayer.id}
                playerName={selectedPlayer.name}
                timelineData={timelineData}
              />
            ) : (
              <Card>
                <CardContent className="py-8">
                  <p className="text-muted-foreground text-center">
                    Inte tillräckligt med historisk data för att visa tidslinje. 
                    Minst 2 utvecklingsposter krävs.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            {selectedPlayer.development && (
              <DevelopmentInsights
                currentDevelopment={selectedPlayer.development}
                previousDevelopment={previousDevelopment}
                playerName={selectedPlayer.name}
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

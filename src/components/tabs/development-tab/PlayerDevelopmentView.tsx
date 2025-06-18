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
import { TrendingUp, TrendingDown, Calendar, Target, BarChart3, Clock, GitCompare, Trophy, Users, Star } from "lucide-react";
import { ActivitySummaryCard } from "@/components/activity-summary/ActivitySummaryCard";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

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

  // Calculate player statistics
  const playerStats = React.useMemo(() => {
    if (!selectedPlayer) return null;
    return calculatePlayerStats(selectedPlayer, activities);
  }, [selectedPlayer, activities]);

  // Calculate unique teammates
  const uniqueTeammatesCount = React.useMemo(() => {
    if (!selectedPlayer) return 0;
    return calculateUniqueTeammates(selectedPlayer.id, activities);
  }, [selectedPlayer, activities]);

  // Calculate participation rate
  const participationRate = React.useMemo(() => {
    if (!selectedPlayer) return 0;
    const totalActivities = activities.length;
    const playerActivities = activities.filter(a => a.participants?.includes(selectedPlayer.id));
    return totalActivities > 0 ? Math.round((playerActivities.length / totalActivities) * 100) : 0;
  }, [selectedPlayer, activities]);

  // Calculate recent form (last 5 matches)
  const recentForm = React.useMemo(() => {
    if (!selectedPlayer) return 0;
    const last5Matches = activities
      .filter(a => a.type === 'match' && a.participants?.includes(selectedPlayer.id))
      .slice(-5);
    const wins = last5Matches.filter(m => m.isWin === true).length;
    return last5Matches.length > 0 ? Math.round((wins / last5Matches.length) * 100) : 0;
  }, [selectedPlayer, activities]);

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

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Aktivitetssammanfattning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Senaste aktivitet och totaler */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Senaste aktivitet</div>
                      <div className="font-medium">
                        {playerActivities[0] ? (
                          <div className="flex flex-col gap-1">
                            <div>{playerActivities[0].name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(playerActivities[0].date).toLocaleDateString()}
                            </div>
                          </div>
                        ) : (
                          "Ingen aktivitet registrerad"
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">Totala aktiviteter</div>
                      <div className="font-medium text-2xl">{playerActivities.length}</div>
                    </div>
                  </div>

                  {/* Aktivitetstyper */}
                  <div>
                    <div className="text-sm font-medium mb-3">Fördelning</div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">
                          {playerActivities.filter(a => a.type === 'match').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Matcher</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">
                          {playerActivities.filter(a => a.type === 'cup').length}
                        </div>
                        <div className="text-sm text-muted-foreground">Cuper</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="text-2xl font-bold">{history.length}</div>
                        <div className="text-sm text-muted-foreground">Utvecklingsposter</div>
                      </div>
                    </div>
                  </div>

                  {/* Medspelare */}
                  <div>
                    <div className="text-sm font-medium mb-3">Medspelare</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-3xl font-bold mb-1">
                          {selectedPlayer && calculateUniqueTeammates(selectedPlayer.id, activities)}
                        </div>
                        <div className="text-sm text-muted-foreground">Unika medspelare</div>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <div className="text-3xl font-bold mb-1">
                          {playerActivities.reduce((max, activity) => {
                            const teamSize = activity.participants?.length || 0;
                            return teamSize > max ? teamSize : max;
                          }, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Största lagstorlek</div>
                      </div>
                    </div>
                  </div>

                  {/* Matchstatistik om det finns matcher */}
                  {playerActivities.some(a => a.type === 'match') && (
                    <div>
                      <div className="text-sm font-medium mb-3">Matchstatistik</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {playerActivities.filter(a => a.type === 'match' && a.isWin === true).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Vinster</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {playerActivities.filter(a => 
                              a.type === 'match' && 
                              a.homeScore !== undefined && 
                              a.awayScore !== undefined && 
                              a.homeScore === a.awayScore
                            ).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Oavgjorda</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {playerActivities.filter(a => a.type === 'match' && a.isWin === false).length}
                          </div>
                          <div className="text-sm text-muted-foreground">Förluster</div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 text-center">
                          <div className="text-2xl font-bold">
                            {playerActivities
                              .filter(a => a.type === 'match')
                              .reduce((total, match) => {
                                const goals = match.player_stats?.goals?.[selectedPlayer?.id] || 0;
                                return total + goals;
                              }, 0)}
                          </div>
                          <div className="text-sm text-muted-foreground">Mål</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Statistics Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Statistik
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Matcher & Resultat */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Matcher & Resultat
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Matcher</span>
                        <span className="font-medium">{playerStats?.matches || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Vinster</span>
                        <span className="font-medium text-green-600">{playerStats?.wins || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Oavgjorda</span>
                        <span className="font-medium text-yellow-600">{playerStats?.draws || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Förluster</span>
                        <span className="font-medium text-red-600">{playerStats?.losses || 0}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Vinstprocent</span>
                        <span className="font-medium">{playerStats?.winRate || 0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Målstatistik */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Målstatistik
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mål</span>
                        <span className="font-medium">{playerStats?.totalGoals || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assist</span>
                        <span className="font-medium">{playerStats?.totalAssists || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Mål/match</span>
                        <span className="font-medium">{playerStats?.totalGoals && playerStats.matches ? (playerStats.totalGoals / playerStats.matches).toFixed(2) : "0"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Poäng/match</span>
                        <span className="font-medium">{((playerStats?.totalGoals || 0) + (playerStats?.totalAssists || 0)) / (playerStats?.matches || 1)}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span className="text-muted-foreground">Totala poäng</span>
                        <span className="font-medium">{(playerStats?.totalGoals || 0) + (playerStats?.totalAssists || 0)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Övrigt */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Övrigt
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Medspelare</span>
                        <span className="font-medium">{uniqueTeammatesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Deltagande</span>
                        <span className="font-medium">{participationRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Form (5 matcher)</span>
                        <span className={`font-medium ${
                          recentForm >= 60 ? 'text-green-600' : 
                          recentForm >= 40 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>{recentForm}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prestationer badges */}
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Prestationer
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {(playerStats?.totalGoals || 0) > 0 && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {playerStats?.totalGoals} mål
                      </Badge>
                    )}
                    {(playerStats?.totalAssists || 0) > 0 && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {playerStats?.totalAssists} assist
                      </Badge>
                    )}
                    {(playerStats?.winRate || 0) > 0 && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {playerStats?.winRate}% vinst
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

            {/* Resten av innehållet */}
            {history.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Utvecklingshistorik
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="min-w-[100px] text-sm text-muted-foreground">
                          {new Date(entry.recorded_at).toLocaleDateString()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {Object.entries(entry.development_data)
                              .filter(([key]) => key !== 'id' && entry.development_data[key] !== undefined)
                              .map(([key, value]) => (
                                <span key={key} className="mr-2">
                                  {key}: {value}
                                </span>
                              ))}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {entry.notes || 'Ingen anteckning'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

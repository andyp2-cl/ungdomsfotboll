import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Player, Activity } from "@/types/player";
import { DevelopmentChart } from "./DevelopmentChart";
import { PlayerProfileAnalysis } from "./PlayerProfileAnalysis";
import { LeaguesStatsCard } from "./LeaguesStatsCard";
import { DevelopmentHistoryButton } from "@/components/development-tracking/DevelopmentHistoryButton";
import { DevelopmentSummaryCard } from "@/components/development-tracking/DevelopmentSummaryCard";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";
import { Calendar, MapPin, Users, Edit, BarChart3, User, Target } from "lucide-react";
import { formatPositions } from "@/utils/positionUtils";
import { ActivitySummaryCard } from "@/components/activity-summary/ActivitySummaryCard";

interface PlayerDetailViewProps {
  player: Player;
  activities: Activity[];
  onEdit?: () => void;
  onClose?: () => void;
}

export function PlayerDetailView({
  player,
  activities,
  onEdit,
  onClose
}: PlayerDetailViewProps) {
  const { history } = useDevelopmentHistory(player.id);
  
  // Get activities for this player
  const playerActivities = activities
    .filter(activity => activity.participants?.includes(player.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const recentActivities = playerActivities.slice(0, 5);
  
  // Get development history for comparison
  const previousDevelopment = history.length > 1 ? history[1].development_data : undefined;
  const lastUpdated = history.length > 0 ? history[0].recorded_at : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {player.image && (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                  <img 
                    src={player.image} 
                    alt={player.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div>
                <CardTitle className="text-xl">{player.name}</CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {player.grade && (
                    <Badge variant="outline">{player.grade}</Badge>
                  )}
                  {player.positions && player.positions.length > 0 && (
                    <Badge variant="secondary">
                      {formatPositions(player.positions)}
                    </Badge>
                  )}
                  {player.jerseyNumber && (
                    <Badge variant="outline">#{player.jerseyNumber}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {player.development && (
                <DevelopmentHistoryButton
                  playerId={player.id}
                  playerName={player.name}
                  currentDevelopment={player.development}
                />
              )}
              {onEdit && (
                <Button onClick={onEdit} variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Redigera
                </Button>
              )}
              {onClose && (
                <Button onClick={onClose} variant="ghost" size="sm">
                  Stäng
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Development Analysis Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Översikt
          </TabsTrigger>
          <TabsTrigger value="development" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Utveckling
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Aktiviteter
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Development Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Grundläggande utveckling</CardTitle>
              </CardHeader>
              <CardContent>
                {player.development ? (
                  <DevelopmentChart 
                    development={player.development} 
                    className="h-[300px]" 
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Ingen utvecklingsdata tillgänglig
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Development Summary */}
            {player.development && (
              <DevelopmentSummaryCard
                playerName={player.name}
                current={player.development}
                previous={previousDevelopment}
                lastUpdated={lastUpdated}
              />
            )}

            {/* Leagues Statistics Card */}
            <LeaguesStatsCard 
              player={player}
              activities={activities}
              className="md:col-span-1"
            />

            {/* Activity Summary */}
            <ActivitySummaryCard
              activities={playerActivities}
              players={[player]}
              className="md:col-span-2 lg:col-span-3"
            />
          </div>
        </TabsContent>

        <TabsContent value="development" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Core Development */}
            <Card>
              <CardHeader>
                <CardTitle>Grundfärdigheter</CardTitle>
              </CardHeader>
              <CardContent>
                {player.development ? (
                  <DevelopmentChart 
                    development={player.development} 
                    className="h-[300px]"
                    showExtended={false}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Ingen utvecklingsdata tillgänglig
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Extended Development */}
            <Card>
              <CardHeader>
                <CardTitle>Detaljerad utveckling</CardTitle>
              </CardHeader>
              <CardContent>
                {player.development ? (
                  <DevelopmentChart 
                    development={player.development} 
                    className="h-[300px]"
                    showExtended={true}
                  />
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Ingen utvecklingsdata tillgänglig
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Add Leagues Stats in Development tab as well */}
          <div className="grid gap-4 md:grid-cols-2">
            <LeaguesStatsCard 
              player={player}
              activities={activities}
              className="md:col-span-1"
            />
            
            {/* Development Summary in development tab */}
            {player.development && (
              <DevelopmentSummaryCard
                playerName={player.name}
                current={player.development}
                previous={previousDevelopment}
                lastUpdated={lastUpdated}
              />
            )}
          </div>
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          {player.development ? (
            <PlayerProfileAnalysis 
              development={player.development}
              playerName={player.name}
              className="w-full"
            />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  Ingen utvecklingsdata tillgänglig för profilanalys
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Senaste aktiviteter
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{activity.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(activity.date).toLocaleDateString('sv-SE')}
                          {activity.location?.name && (
                            <>
                              <MapPin className="h-3 w-3 ml-2" />
                              {activity.location.name}
                            </>
                          )}
                        </div>
                      </div>
                      <Badge variant={activity.type === 'match' ? 'default' : 'secondary'}>
                        {activity.type === 'match' ? 'Match' : 'Cup'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Inga aktiviteter registrerade för denna spelare
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

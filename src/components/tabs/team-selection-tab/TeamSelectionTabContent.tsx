
import React, { useState } from 'react';
import { Player, Activity } from '@/types/player';
import { useTeamSelection } from '@/hooks/useTeamSelection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, Calendar, TrendingUp } from 'lucide-react';
import { TeamSelectionOverview } from './components/TeamSelectionOverview';
import { MatchAssignments } from './components/MatchAssignments';
import { TrainingImport } from './components/TrainingImport';
import { PlayerStatsView } from './components/PlayerStatsView';

interface TeamSelectionTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerUpdate?: (player: Player) => void;
  onActivityUpdate?: (activity: Activity) => void;
}

export function TeamSelectionTabContent({
  players,
  activities,
  onPlayerUpdate,
  onActivityUpdate
}: TeamSelectionTabContentProps) {
  const { teamSelectionData, isLoading, suggestOptimalLineup } = useTeamSelection(players, activities);
  const [activeTab, setActiveTab] = useState('overview');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Laddar laguttagningsdata...</p>
        </div>
      </div>
    );
  }

  const { upcomingMatches, playerStats, conflicts } = teamSelectionData;

  return (
    <div className="space-y-6">
      {/* Konfliktvarningar */}
      {conflicts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>{conflicts.length} konflikter upptäckta!</strong>
            {conflicts.map(conflict => (
              <div key={conflict.playerId} className="mt-1">
                {conflict.playerName}: {conflict.reason === 'same_day' ? 'Flera matcher samma dag' : conflict.reason}
              </div>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistik-kort */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kommande matcher</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingMatches.length}</div>
            <p className="text-xs text-muted-foreground">
              Nästa 30 dagarna
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktiva spelare</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.filter(p => p.isActive !== false).length}</div>
            <p className="text-xs text-muted-foreground">
              Tillgängliga för uttagning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Träning/Match ratio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.length > 0 ? 
                (playerStats.reduce((sum, p) => sum + p.trainingMatchRatio, 0) / playerStats.length).toFixed(1) : 
                '0'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Genomsnitt för alla spelare
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Huvudinnehåll */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Översikt</TabsTrigger>
          <TabsTrigger value="assignments">Matchuttagningar</TabsTrigger>
          <TabsTrigger value="training">Träningsimport</TabsTrigger>
          <TabsTrigger value="stats">Spelarstatistik</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <TeamSelectionOverview 
            upcomingMatches={upcomingMatches}
            playerStats={playerStats}
            conflicts={conflicts}
          />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <MatchAssignments 
            upcomingMatches={upcomingMatches}
            players={players}
            playerStats={playerStats}
            suggestOptimalLineup={suggestOptimalLineup}
            onActivityUpdate={onActivityUpdate}
          />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingImport 
            players={players}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <PlayerStatsView 
            playerStats={playerStats}
            players={players}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

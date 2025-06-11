
import React, { useState } from 'react';
import { Activity, Player } from '@/types/player';
import { PlayerTrainingOverview } from '@/types/training';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/utils/formatDate';
import { Users, Calendar, AlertTriangle } from 'lucide-react';

interface MatchAssignmentsProps {
  upcomingMatches: Activity[];
  players: Player[];
  playerStats: PlayerTrainingOverview[];
  suggestOptimalLineup: (match: Activity) => Player[];
  onActivityUpdate?: (activity: Activity) => void;
}

export function MatchAssignments({
  upcomingMatches,
  players,
  playerStats,
  suggestOptimalLineup,
  onActivityUpdate
}: MatchAssignmentsProps) {
  const [selectedMatch, setSelectedMatch] = useState<Activity | null>(null);
  const [suggestedLineup, setSuggestedLineup] = useState<Player[]>([]);

  const handleMatchSelect = (match: Activity) => {
    setSelectedMatch(match);
    const lineup = suggestOptimalLineup(match);
    setSuggestedLineup(lineup);
  };

  const handleApplyLineup = async () => {
    if (!selectedMatch || !onActivityUpdate) return;

    const updatedMatch: Activity = {
      ...selectedMatch,
      participants: suggestedLineup.map(p => p.id)
    };

    await onActivityUpdate(updatedMatch);
    setSelectedMatch(null);
    setSuggestedLineup([]);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kommande matcher */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Kommande matcher
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingMatches.length > 0 ? (
              upcomingMatches.slice(0, 10).map(match => (
                <div 
                  key={match.id} 
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedMatch?.id === match.id ? 'border-green-500 bg-green-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleMatchSelect(match)}
                >
                  <div className="flex items-center justify-between">
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
                        {match.participants?.length || 0}/11 spelare
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Inga kommande matcher att tilldela
              </p>
            )}
          </CardContent>
        </Card>

        {/* Föreslagen uppställning */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Föreslagen uppställning
              {selectedMatch && (
                <Badge variant="secondary" className="ml-2">
                  {selectedMatch.name}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMatch ? (
              <div className="space-y-4">
                {suggestedLineup.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-2">
                      {suggestedLineup.map((player, index) => {
                        const stats = playerStats.find(s => s.playerId === player.id);
                        return (
                          <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-800 font-semibold text-xs">
                                {index + 1}
                              </div>
                              <div>
                                <div className="font-medium text-sm">{player.name}</div>
                                <div className="text-xs text-muted-foreground">{player.grade}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              {stats && (
                                <div className="text-xs text-muted-foreground">
                                  Ratio: {stats.trainingMatchRatio.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <Button 
                      onClick={handleApplyLineup}
                      className="w-full"
                      disabled={!onActivityUpdate}
                    >
                      Tillämpa uppställning
                    </Button>
                  </>
                ) : (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Kunde inte generera en uppställning för denna match. 
                      Kontrollera att det finns tillräckligt med spelare tillgängliga.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Välj en match för att se föreslagen uppställning
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

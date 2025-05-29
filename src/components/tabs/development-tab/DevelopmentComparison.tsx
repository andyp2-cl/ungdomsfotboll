
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Player, Activity, PlayerDevelopment } from "@/types/player";
import { DevelopmentChart } from "@/components/player-detail/DevelopmentChart";
import { X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DevelopmentComparisonProps {
  players: Player[];
  activities: Activity[];
}

export function DevelopmentComparison({
  players,
  activities
}: DevelopmentComparisonProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<Player[]>([]);
  const [playerToAdd, setPlayerToAdd] = useState<string>("");

  // Filter out trainers
  const activePlayers = players.filter(player => 
    !player.positions?.includes("TRÄNARE") && player.development
  );

  const availablePlayers = activePlayers.filter(player => 
    !selectedPlayers.some(sp => sp.id === player.id)
  );

  const addPlayer = (playerId: string) => {
    const player = activePlayers.find(p => p.id === playerId);
    if (player && selectedPlayers.length < 4) {
      setSelectedPlayers([...selectedPlayers, player]);
      setPlayerToAdd("");
    }
  };

  const removePlayer = (playerId: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p.id !== playerId));
  };

  const categoryLabels = {
    technical: 'Teknik',
    gameUnderstanding: 'Spelförståelse',
    passing: 'Passningsspel',
    offensive: 'Offensiv',
    defensive: 'Defensiv',
    mentality: 'Mentalitet'
  };

  // Calculate comparison stats
  const comparisonStats = React.useMemo(() => {
    if (selectedPlayers.length < 2) return null;

    const categories = Object.keys(categoryLabels) as (keyof PlayerDevelopment)[];
    const stats: Record<string, { values: number[], leader: Player, average: number }> = {};

    categories.forEach(category => {
      const values = selectedPlayers.map(p => p.development![category]);
      const maxValue = Math.max(...values);
      const leader = selectedPlayers.find(p => p.development![category] === maxValue)!;
      const average = values.reduce((sum, val) => sum + val, 0) / values.length;

      stats[category] = {
        values,
        leader,
        average: Math.round(average * 10) / 10
      };
    });

    return stats;
  }, [selectedPlayers]);

  return (
    <div className="space-y-6">
      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Jämför spelare</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Select value={playerToAdd} onValueChange={setPlayerToAdd}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Välj spelare att lägga till (max 4)" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.map(player => (
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
            <Button 
              onClick={() => playerToAdd && addPlayer(playerToAdd)}
              disabled={!playerToAdd || selectedPlayers.length >= 4}
            >
              Lägg till
            </Button>
          </div>

          {/* Selected Players */}
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map(player => (
              <Badge key={player.id} variant="secondary" className="flex items-center gap-1">
                {player.name}
                <button
                  onClick={() => removePlayer(player.id)}
                  className="hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedPlayers.length > 0 && (
        <>
          {/* Development Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            {selectedPlayers.map(player => (
              <Card key={player.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {player.name}
                    {player.grade && (
                      <Badge variant="outline">{player.grade}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DevelopmentChart 
                    development={player.development} 
                    className="h-[200px]" 
                  />
                  <div className="mt-2 text-center">
                    <span className="text-sm text-muted-foreground">
                      Genomsnitt: {Math.round(
                        Object.values(player.development!).reduce((sum, val) => sum + val, 0) / 6 * 10
                      ) / 10}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Table */}
          {comparisonStats && (
            <Card>
              <CardHeader>
                <CardTitle>Detaljerad jämförelse</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Kategori</th>
                        {selectedPlayers.map(player => (
                          <th key={player.id} className="text-center p-2">
                            {player.name}
                          </th>
                        ))}
                        <th className="text-center p-2">Genomsnitt</th>
                        <th className="text-center p-2">Ledare</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(categoryLabels).map(([key, label]) => {
                        const stat = comparisonStats[key];
                        return (
                          <tr key={key} className="border-b">
                            <td className="p-2 font-medium">{label}</td>
                            {selectedPlayers.map((player, index) => {
                              const value = player.development![key as keyof PlayerDevelopment];
                              const isLeader = stat.leader.id === player.id;
                              return (
                                <td key={player.id} className={`text-center p-2 ${
                                  isLeader ? 'font-bold text-green-600' : ''
                                }`}>
                                  {value}
                                </td>
                              );
                            })}
                            <td className="text-center p-2">{stat.average}</td>
                            <td className="text-center p-2 text-green-600 font-medium">
                              {stat.leader.name}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Insikter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {comparisonStats && Object.entries(comparisonStats).map(([key, stat]) => (
                  <div key={key} className="p-3 bg-muted/50 rounded-lg">
                    <strong>{categoryLabels[key as keyof typeof categoryLabels]}:</strong>{' '}
                    <span className="text-green-600 font-medium">{stat.leader.name}</span> leder med {
                      stat.leader.development![key as keyof PlayerDevelopment]
                    } poäng. Genomsnittet för gruppen är {stat.average}.
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {selectedPlayers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              Välj minst två spelare för att börja jämföra deras utveckling.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

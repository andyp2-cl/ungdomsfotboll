
import React from "react";
import { Player } from "@/types/player";
import { PlayerCombination, getBestPartnersForPlayer } from "@/utils/playerCombinations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Users, Star } from "lucide-react";

interface PlayerPartnerAnalysisProps {
  players: Player[];
  combinations: PlayerCombination[];
  selectedPlayer: string | null;
  onPlayerSelect: (playerId: string) => void;
}

export function PlayerPartnerAnalysis({ 
  players, 
  combinations, 
  selectedPlayer, 
  onPlayerSelect 
}: PlayerPartnerAnalysisProps) {
  const selectedPlayerData = players.find(p => p.id === selectedPlayer);
  const bestPartners = selectedPlayer ? getBestPartnersForPlayer(selectedPlayer, combinations) : [];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.5) return "bg-green-500";
    if (efficiency >= 1.2) return "bg-blue-500";
    if (efficiency >= 1.0) return "bg-yellow-500";
    return "bg-gray-500";
  };

  const getWinRateColor = (winRate: number) => {
    if (winRate >= 70) return "text-green-600";
    if (winRate >= 50) return "text-blue-600";
    if (winRate >= 30) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Välj spelare för analys:</label>
        <Select
          value={selectedPlayer || ""}
          onValueChange={onPlayerSelect}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Välj en spelare..." />
          </SelectTrigger>
          <SelectContent>
            {players.map((player) => (
              <SelectItem key={player.id} value={player.id}>
                <div className="flex items-center gap-2">
                  <span>{player.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {player.positions?.[0] || 'N/A'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {player.grade || 'N/A'}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPlayerData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              {selectedPlayerData.name}
            </CardTitle>
            <CardDescription>
              Position: {selectedPlayerData.positions?.[0] || 'N/A'} | 
              Betyg: {selectedPlayerData.grade || 'N/A'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {bestPartners.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Inga partners hittade</p>
                <p className="text-sm">Spelaren behöver ha spelat med andra i minst 2 matcher</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="font-semibold text-lg mb-3">Bästa partners:</h4>
                {bestPartners.map((combo, index) => {
                  const partnerName = combo.playerNames.find(name => name !== selectedPlayerData.name);
                  const partnerId = combo.playerIds.find(id => id !== selectedPlayer);
                  
                  return (
                    <div
                      key={`${combo.playerIds[0]}-${combo.playerIds[1]}`}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-muted-foreground">
                            #{index + 1}
                          </div>
                          {index === 0 && <Star className="h-5 w-5 text-yellow-500" />}
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-lg">{partnerName}</span>
                            <Badge
                              className={`${getEfficiencyColor(combo.combinationEfficiency)} text-white`}
                            >
                              {combo.combinationEfficiency}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {combo.matchesTogether} matcher
                            </span>
                            <span className={`flex items-center gap-1 font-medium ${getWinRateColor(combo.winRate)}`}>
                              <TrendingUp className="h-4 w-4" />
                              {combo.winRate}% vinster
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {combo.totalGoals}M + {combo.totalAssists}A
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right text-sm">
                          <div className="text-muted-foreground">Synergi</div>
                          <div className="font-medium">{combo.positionSynergy}</div>
                        </div>
                        
                        {partnerId && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPlayerSelect(partnerId)}
                            className="text-xs px-2 py-1"
                          >
                            Visa
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

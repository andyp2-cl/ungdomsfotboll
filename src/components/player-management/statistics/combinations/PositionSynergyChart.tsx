
import React from "react";
import { PlayerCombination } from "@/utils/playerCombinations";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Users, Target } from "lucide-react";

interface PositionSynergyChartProps {
  positionAnalysis: Record<string, {
    averageEfficiency: number;
    bestCombination: PlayerCombination | null;
    count: number;
  }>;
  onPlayerSelect?: (playerId: string) => void;
}

export function PositionSynergyChart({ positionAnalysis, onPlayerSelect }: PositionSynergyChartProps) {
  const sortedPositions = Object.entries(positionAnalysis)
    .sort(([, a], [, b]) => b.averageEfficiency - a.averageEfficiency);

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.3) return "bg-green-500";
    if (efficiency >= 1.1) return "bg-blue-500";
    if (efficiency >= 0.9) return "bg-yellow-500";
    return "bg-red-500";
  };

  const formatPosition = (positionKey: string) => {
    return positionKey.split('-').join(' + ');
  };

  return (
    <div className="space-y-4">
      {sortedPositions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Ingen positionsdata tillgänglig</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedPositions.map(([positionKey, analysis], index) => (
            <Card key={positionKey} className="relative">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-bold text-muted-foreground">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{formatPosition(positionKey)}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {analysis.count} kombinationer
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge
                      className={`${getEfficiencyColor(analysis.averageEfficiency)} text-white`}
                    >
                      ⌀ {analysis.averageEfficiency.toFixed(2)}
                    </Badge>
                  </div>
                </div>

                {analysis.bestCombination && (
                  <div className="bg-muted/50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Bästa kombination:</p>
                        <p className="text-lg">
                          {analysis.bestCombination.playerNames[0]} & {analysis.bestCombination.playerNames[1]}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {analysis.bestCombination.winRate}% vinster
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {analysis.bestCombination.totalGoals}M + {analysis.bestCombination.totalAssists}A
                          </span>
                          <span>
                            {analysis.bestCombination.matchesTogether} matcher
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        {analysis.bestCombination.playerIds.map((playerId, playerIndex) => (
                          <Button
                            key={playerId}
                            variant="outline"
                            size="sm"
                            onClick={() => onPlayerSelect?.(playerId)}
                            className="text-xs px-2 py-1"
                          >
                            {analysis.bestCombination!.playerNames[playerIndex]}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

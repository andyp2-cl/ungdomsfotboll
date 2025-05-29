
import React from "react";
import { PlayerCombination } from "@/utils/playerCombinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, TrendingUp, Target, Users } from "lucide-react";

interface CombinationsListProps {
  combinations: PlayerCombination[];
  onPlayerSelect?: (playerId: string) => void;
}

export function CombinationsList({ combinations, onPlayerSelect }: CombinationsListProps) {
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
    <div className="space-y-3">
      {combinations.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Inga kombinationer hittade</p>
          <p className="text-sm">Spelare behöver ha spelat minst 2 matcher tillsammans</p>
        </div>
      ) : (
        combinations.map((combo, index) => (
          <div
            key={`${combo.playerIds[0]}-${combo.playerIds[1]}`}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-muted-foreground">
                  #{index + 1}
                </div>
                {index === 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-lg">
                    {combo.playerNames[0]} & {combo.playerNames[1]}
                  </span>
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
              
              <div className="flex flex-col gap-1">
                {combo.playerIds.map((playerId, playerIndex) => (
                  <Button
                    key={playerId}
                    variant="outline"
                    size="sm"
                    onClick={() => onPlayerSelect?.(playerId)}
                    className="text-xs px-2 py-1"
                  >
                    {combo.playerNames[playerIndex]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}


import React from "react";
import { PlayerCombination } from "@/utils/playerCombinations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, TrendingUp, Target, Users, Info } from "lucide-react";

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

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 1.5) return "Utmärkt";
    if (efficiency >= 1.2) return "Bra";
    if (efficiency >= 1.0) return "OK";
    if (efficiency >= 0.8) return "Svag";
    return "Dålig";
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge className={`${getEfficiencyColor(combo.combinationEfficiency)} text-white cursor-help`}>
                          {combo.combinationEfficiency} ({getEfficiencyLabel(combo.combinationEfficiency)})
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Kombinationseffektivitet: {combo.combinationEfficiency}</p>
                        <p>Baserat på vinst%, mål/assists och positionssynergi</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-help">
                          <Users className="h-4 w-4" />
                          {combo.matchesTogether} matcher
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Antal matcher spelat tillsammans</p>
                        <p>Vinster: {combo.wins}, Oavgjort: {combo.draws}, Förluster: {combo.losses}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className={`flex items-center gap-1 font-medium ${getWinRateColor(combo.winRate)} cursor-help`}>
                          <TrendingUp className="h-4 w-4" />
                          {combo.winRate}% vinster
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Vinstprocent när de spelar tillsammans</p>
                        <p>{combo.wins} vinster av {combo.matchesTogether} matcher</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex items-center gap-1 cursor-help">
                          <Target className="h-4 w-4" />
                          {combo.totalGoals}M + {combo.totalAssists}A
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Totalt mål och assists för båda spelarna</p>
                        <p>Genomsnitt per match: {combo.averagePerformance}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right text-sm">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <div className="text-muted-foreground flex items-center gap-1">
                          Synergi <Info className="h-3 w-3" />
                        </div>
                        <div className="font-medium">{combo.positionSynergy}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Positionssynergi (1.0-1.4)</p>
                      <p>Hur väl spelarnas positioner kompletterar varandra</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

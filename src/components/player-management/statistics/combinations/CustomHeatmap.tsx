
import React from "react";
import { Player } from "@/types/player";
import { CombinationMatrix as MatrixType } from "@/utils/playerCombinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, Users, Target, Info } from "lucide-react";

interface CustomHeatmapProps {
  matrix: MatrixType;
  players: Player[];
  selectedPlayerIds: string[];
  onPlayerSelect?: (playerId: string) => void;
}

export function CustomHeatmap({ 
  matrix, 
  players, 
  selectedPlayerIds, 
  onPlayerSelect 
}: CustomHeatmapProps) {
  const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));

  const getEfficiencyIntensity = (efficiency: number) => {
    // Convert efficiency to a color intensity (0-100)
    const normalized = Math.min(Math.max(efficiency - 0.5, 0), 2) / 2; // Scale 0.5-2.5 to 0-1
    return Math.round(normalized * 100);
  };

  const getHeatmapColor = (efficiency: number) => {
    const intensity = getEfficiencyIntensity(efficiency);
    
    if (efficiency >= 1.5) {
      return `rgba(34, 197, 94, ${0.3 + (intensity / 100) * 0.7})`; // Green
    } else if (efficiency >= 1.2) {
      return `rgba(59, 130, 246, ${0.3 + (intensity / 100) * 0.7})`; // Blue
    } else if (efficiency >= 1.0) {
      return `rgba(234, 179, 8, ${0.3 + (intensity / 100) * 0.7})`; // Yellow
    } else if (efficiency >= 0.8) {
      return `rgba(249, 115, 22, ${0.3 + (intensity / 100) * 0.7})`; // Orange
    } else {
      return `rgba(239, 68, 68, ${0.3 + (intensity / 100) * 0.7})`; // Red
    }
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 1.5) return "Utmärkt";
    if (efficiency >= 1.2) return "Bra";
    if (efficiency >= 1.0) return "OK";
    if (efficiency >= 0.8) return "Svag";
    return "Dålig";
  };

  const calculateStats = () => {
    let totalCombinations = 0;
    let totalEfficiency = 0;
    let totalMatches = 0;
    let totalWinRate = 0;
    let validCombinations = 0;

    for (let i = 0; i < selectedPlayers.length; i++) {
      for (let j = i + 1; j < selectedPlayers.length; j++) {
        const player1 = selectedPlayers[i];
        const player2 = selectedPlayers[j];
        const combination = matrix[player1.id]?.[player2.id];
        
        if (combination && combination.matchesTogether >= 2) {
          totalCombinations++;
          totalEfficiency += combination.efficiency;
          totalMatches += combination.matchesTogether;
          totalWinRate += combination.winRate;
          validCombinations++;
        }
      }
    }

    return {
      totalCombinations: validCombinations,
      averageEfficiency: validCombinations > 0 ? totalEfficiency / validCombinations : 0,
      totalMatches,
      averageWinRate: validCombinations > 0 ? totalWinRate / validCombinations : 0
    };
  };

  const stats = calculateStats();

  if (selectedPlayers.length < 2) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Välj minst 2 spelare för att visa heatmap</p>
        <p className="text-sm mt-2">Använd kryssrutorna i Matris-fliken eller spelarval-kontrollen ovan</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Info Section */}
      <div className="p-3 border rounded-lg bg-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="font-medium text-blue-800">Heatmap-förklaring</span>
        </div>
        <p className="text-sm text-blue-700">
          Färgintensitet och nyans visar kombinationseffektivitet. Mörkare färg = högre effektivitet. 
          Hovra över celler för detaljerad information om varje spelarkombination.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-lg text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm text-muted-foreground">Kombinationer</div>
                  <div className="text-lg font-bold">{stats.totalCombinations}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Antal giltiga spelarkombinationer (≥2 matcher)</p>
                <p>Av {selectedPlayers.length} valda spelare</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="p-3 border rounded-lg text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="text-sm text-muted-foreground">Genomsnitt effektivitet</div>
                  <div className="text-lg font-bold">{stats.averageEfficiency.toFixed(2)}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Genomsnittlig kombinationseffektivitet</p>
                <p>Högre värde = bättre sammansatt prestanda</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="p-3 border rounded-lg text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                  <div className="text-sm text-muted-foreground">Vinst %</div>
                  <div className="text-lg font-bold">{stats.averageWinRate.toFixed(1)}%</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Genomsnittlig vinstprocent för valda kombinationer</p>
                <p>Baserat på {stats.totalMatches} totala matcher</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        <div className="p-3 border rounded-lg text-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-help">
                  <div className="text-sm text-muted-foreground">Total matcher</div>
                  <div className="text-lg font-bold">{stats.totalMatches}</div>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Totalt antal matcher för alla kombinationer</p>
                <p>Genomsnitt per kombination: {stats.totalCombinations > 0 ? (stats.totalMatches / stats.totalCombinations).toFixed(1) : 0}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-auto border rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead>
            <tr>
              <th className="p-2 border bg-muted text-left min-w-[120px]">Spelare</th>
              {selectedPlayers.map((player) => (
                <th key={player.id} className="p-1 border bg-muted text-center min-w-[60px]">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onPlayerSelect?.(player.id)}
                    className="text-xs p-1 h-auto transform -rotate-45 origin-center"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                  >
                    {player.name.split(' ')[0]}
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {selectedPlayers.map((rowPlayer) => (
              <tr key={rowPlayer.id}>
                <td className="p-2 border bg-muted font-medium">
                  <Button
                    variant="ghost"
                    onClick={() => onPlayerSelect?.(rowPlayer.id)}
                    className="justify-start p-0 h-auto font-medium text-left"
                  >
                    {rowPlayer.name}
                  </Button>
                </td>
                {selectedPlayers.map((colPlayer) => {
                  if (rowPlayer.id === colPlayer.id) {
                    return (
                      <td key={colPlayer.id} className="p-1 border text-center bg-gray-100">
                        <span className="text-muted-foreground">-</span>
                      </td>
                    );
                  }

                  const combination = matrix[rowPlayer.id]?.[colPlayer.id];
                  
                  if (!combination || combination.matchesTogether < 2) {
                    return (
                      <td key={colPlayer.id} className="p-1 border text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-help">N/A</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Inte tillräckligt med data</p>
                              <p>Krävs minst 2 matcher tillsammans</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={colPlayer.id} 
                      className="p-1 border text-center relative"
                      style={{ backgroundColor: getHeatmapColor(combination.efficiency) }}
                    >
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="px-2 py-1 rounded text-xs font-bold text-black cursor-help">
                              {combination.efficiency.toFixed(1)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p><strong>Kombination:</strong> {rowPlayer.name} + {colPlayer.name}</p>
                              <p><strong>Effektivitet:</strong> {combination.efficiency.toFixed(2)} ({getEfficiencyLabel(combination.efficiency)})</p>
                              <p><strong>Matcher tillsammans:</strong> {combination.matchesTogether}</p>
                              <p><strong>Vinstprocent:</strong> {combination.winRate}%</p>
                              <p className="text-xs text-muted-foreground">Klicka för att gå till spelarprofil</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted/20 rounded-lg">
        <strong>Tips:</strong> Färgintensitet baserad på kombinationseffektivitet. Mörkare färg = högre effektivitet. 
        Grön = Utmärkt, Blå = Bra, Gul = OK, Orange = Svag, Röd = Dålig.
      </div>
    </div>
  );
}

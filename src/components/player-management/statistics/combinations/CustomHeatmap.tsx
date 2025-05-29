
import React from "react";
import { Player } from "@/types/player";
import { CombinationMatrix as MatrixType } from "@/utils/playerCombinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target } from "lucide-react";

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
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 border rounded-lg text-center">
          <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
          <div className="text-sm text-muted-foreground">Kombinationer</div>
          <div className="text-lg font-bold">{stats.totalCombinations}</div>
        </div>
        <div className="p-3 border rounded-lg text-center">
          <Target className="h-5 w-5 mx-auto mb-1 text-green-500" />
          <div className="text-sm text-muted-foreground">Genomsnitt effektivitet</div>
          <div className="text-lg font-bold">{stats.averageEfficiency.toFixed(2)}</div>
        </div>
        <div className="p-3 border rounded-lg text-center">
          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-500" />
          <div className="text-sm text-muted-foreground">Vinst %</div>
          <div className="text-lg font-bold">{stats.averageWinRate.toFixed(1)}%</div>
        </div>
        <div className="p-3 border rounded-lg text-center">
          <div className="text-sm text-muted-foreground">Total matcher</div>
          <div className="text-lg font-bold">{stats.totalMatches}</div>
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
                        <span className="text-xs text-muted-foreground">N/A</span>
                      </td>
                    );
                  }

                  return (
                    <td 
                      key={colPlayer.id} 
                      className="p-1 border text-center relative"
                      style={{ backgroundColor: getHeatmapColor(combination.efficiency) }}
                    >
                      <div
                        className="px-2 py-1 rounded text-xs font-bold text-black"
                        title={`${combination.matchesTogether} matcher, ${combination.winRate}% vinster, Effektivitet: ${combination.efficiency}`}
                      >
                        {combination.efficiency.toFixed(1)}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted-foreground">
        Färgintensitet baserad på kombinationseffektivitet. Mörkare färg = högre effektivitet.
      </div>
    </div>
  );
}

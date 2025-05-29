
import React from "react";
import { Player } from "@/types/player";
import { CombinationMatrix as MatrixType } from "@/utils/playerCombinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CombinationMatrixProps {
  matrix: MatrixType;
  players: Player[];
  onPlayerSelect?: (playerId: string) => void;
}

export function CombinationMatrix({ matrix, players, onPlayerSelect }: CombinationMatrixProps) {
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.5) return "bg-green-100 border-green-300 text-green-800";
    if (efficiency >= 1.2) return "bg-blue-100 border-blue-300 text-blue-800";
    if (efficiency >= 1.0) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    if (efficiency >= 0.8) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-red-100 border-red-300 text-red-800";
  };

  if (players.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Inga spelare tillgängliga för matris</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Läs kolumnvis: </span>
        <Badge className="bg-green-100 text-green-800">Utmärkt (1.5+)</Badge>
        <Badge className="bg-blue-100 text-blue-800">Bra (1.2+)</Badge>
        <Badge className="bg-yellow-100 text-yellow-800">OK (1.0+)</Badge>
        <Badge className="bg-orange-100 text-orange-800">Svag (0.8+)</Badge>
        <Badge className="bg-red-100 text-red-800">Dålig (&lt;0.8)</Badge>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 border bg-muted text-left min-w-[120px]">Spelare</th>
              {players.slice(0, 12).map((player) => (
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
            {players.slice(0, 12).map((rowPlayer) => (
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
                {players.slice(0, 12).map((colPlayer) => {
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
                    <td key={colPlayer.id} className="p-1 border text-center">
                      <div
                        className={`px-2 py-1 rounded text-xs font-medium border ${getEfficiencyColor(combination.efficiency)}`}
                        title={`${combination.matchesTogether} matcher, ${combination.winRate}% vinster`}
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

      {players.length > 12 && (
        <p className="text-sm text-muted-foreground">
          Visar första 12 spelare. Total: {players.length} spelare.
        </p>
      )}
    </div>
  );
}

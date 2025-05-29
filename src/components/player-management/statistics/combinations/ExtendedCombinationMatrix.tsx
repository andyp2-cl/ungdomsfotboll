
import React from "react";
import { Player } from "@/types/player";
import { CombinationMatrix as MatrixType } from "@/utils/playerCombinations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface ExtendedCombinationMatrixProps {
  matrix: MatrixType;
  players: Player[];
  selectedPlayers: string[];
  onPlayerToggle: (playerId: string) => void;
  onPlayerSelect?: (playerId: string) => void;
}

export function ExtendedCombinationMatrix({ 
  matrix, 
  players, 
  selectedPlayers, 
  onPlayerToggle, 
  onPlayerSelect 
}: ExtendedCombinationMatrixProps) {
  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 1.5) return "bg-green-100 border-green-300 text-green-800";
    if (efficiency >= 1.2) return "bg-blue-100 border-blue-300 text-blue-800";
    if (efficiency >= 1.0) return "bg-yellow-100 border-yellow-300 text-yellow-800";
    if (efficiency >= 0.8) return "bg-orange-100 border-orange-300 text-orange-800";
    return "bg-red-100 border-red-300 text-red-800";
  };

  const getEfficiencyLabel = (efficiency: number) => {
    if (efficiency >= 1.5) return "Utmärkt";
    if (efficiency >= 1.2) return "Bra";
    if (efficiency >= 1.0) return "OK";
    if (efficiency >= 0.8) return "Svag";
    return "Dålig";
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
      <div className="p-4 border rounded-lg bg-muted/10">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-blue-500" />
          <span className="font-medium">Färgkodning och förklaring:</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-green-100 text-green-800 cursor-help justify-center">Utmärkt (1.5+)</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kombinationseffektivitet ≥ 1.5</p>
                <p>Exceptionellt bra kombination</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-blue-100 text-blue-800 cursor-help justify-center">Bra (1.2+)</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kombinationseffektivitet 1.2-1.49</p>
                <p>Stark kombination</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-yellow-100 text-yellow-800 cursor-help justify-center">OK (1.0+)</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kombinationseffektivitet 1.0-1.19</p>
                <p>Genomsnittlig kombination</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-orange-100 text-orange-800 cursor-help justify-center">Svag (0.8+)</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kombinationseffektivitet 0.8-0.99</p>
                <p>Under genomsnitt</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge className="bg-red-100 text-red-800 cursor-help justify-center">Dålig (&lt;0.8)</Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kombinationseffektivitet &lt; 0.8</p>
                <p>Problematisk kombination</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">
          <strong>Tips:</strong> Kryssa i spelare för att inkludera dem i heatmap-analysen. Hovra över värden för detaljerad information.
        </p>
      </div>

      <div className="overflow-auto max-h-[600px] border rounded-lg">
        <table className="w-full border-collapse bg-white">
          <thead className="sticky top-0 bg-white z-10">
            <tr>
              <th className="p-2 border bg-muted text-left min-w-[150px] sticky left-0 z-20">
                <div className="flex items-center gap-2">
                  <span>Spelare</span>
                  <span className="text-xs text-muted-foreground">({players.length})</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3 w-3 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Rad = Första spelaren</p>
                        <p>Kolumn = Andra spelaren</p>
                        <p>Värde = Kombinationseffektivitet</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </th>
              {players.map((player) => (
                <th key={player.id} className="p-1 border bg-muted text-center min-w-[80px]">
                  <div className="flex flex-col items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Checkbox
                              checked={selectedPlayers.includes(player.id)}
                              onCheckedChange={() => onPlayerToggle(player.id)}
                              className="mb-1"
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Inkludera {player.name} i heatmap</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onPlayerSelect?.(player.id)}
                      className="text-xs p-1 h-auto transform -rotate-45 origin-center"
                      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                    >
                      {player.name.split(' ')[0]}
                    </Button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {players.map((rowPlayer) => (
              <tr key={rowPlayer.id}>
                <td className="p-2 border bg-muted font-medium sticky left-0 z-10">
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>
                            <Checkbox
                              checked={selectedPlayers.includes(rowPlayer.id)}
                              onCheckedChange={() => onPlayerToggle(rowPlayer.id)}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Inkludera {rowPlayer.name} i heatmap</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button
                      variant="ghost"
                      onClick={() => onPlayerSelect?.(rowPlayer.id)}
                      className="justify-start p-0 h-auto font-medium text-left"
                    >
                      {rowPlayer.name}
                    </Button>
                  </div>
                </td>
                {players.map((colPlayer) => {
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
                    <td key={colPlayer.id} className="p-1 border text-center">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`px-2 py-1 rounded text-xs font-medium border cursor-help ${getEfficiencyColor(combination.efficiency)}`}
                            >
                              {combination.efficiency.toFixed(1)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1">
                              <p><strong>Kombinationseffektivitet:</strong> {combination.efficiency.toFixed(2)} ({getEfficiencyLabel(combination.efficiency)})</p>
                              <p><strong>Matcher tillsammans:</strong> {combination.matchesTogether}</p>
                              <p><strong>Vinstprocent:</strong> {combination.winRate}%</p>
                              <p><strong>Kombination:</strong> {rowPlayer.name} + {colPlayer.name}</p>
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
    </div>
  );
}

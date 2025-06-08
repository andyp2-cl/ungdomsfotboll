
import React from "react";
import { Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UserCircle } from "lucide-react";
import { isTrainer } from "@/utils/positionUtils";

interface ActivePlayerSelectorProps {
  players: Player[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  onSelectAll: () => void;
  onSelectNone: () => void;
  className?: string;
}

export function ActivePlayerSelector({
  players,
  selectedPlayerIds,
  onPlayerToggle,
  onSelectAll,
  onSelectNone,
  className = ""
}: ActivePlayerSelectorProps) {
  // Filter to only show active players for selection
  const activePlayers = players.filter(player => {
    const isActive = player.isActive !== undefined ? player.isActive : true;
    return isActive;
  });

  const activePlayerCount = activePlayers.length;
  const selectedActiveCount = selectedPlayerIds.filter(id => 
    activePlayers.some(p => p.id === id)
  ).length;

  console.log("ActivePlayerSelector:", {
    totalPlayers: players.length,
    activePlayers: activePlayerCount,
    selectedActive: selectedActiveCount
  });

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium">
          Välj spelare ({selectedActiveCount}/{activePlayerCount} aktiva spelare valda)
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectAll}
          >
            Välj alla aktiva
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSelectNone}
          >
            Välj ingen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
        {activePlayers.map((player) => {
          const isSelected = selectedPlayerIds.includes(player.id);
          const isCoach = isTrainer(player.positions);

          return (
            <div 
              key={player.id}
              className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                isSelected 
                  ? 'bg-blue-50 border-blue-200' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
              onClick={() => onPlayerToggle(player.id)}
            >
              <Checkbox 
                checked={isSelected}
                onChange={() => onPlayerToggle(player.id)}
              />
              
              <div className="flex-shrink-0">
                {player.image ? (
                  <img 
                    src={player.image} 
                    alt={player.name} 
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <UserCircle className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {player.name}
                  </span>
                  {isCoach && (
                    <Badge variant="secondary" className="text-xs">
                      Tränare
                    </Badge>
                  )}
                </div>
                {player.jerseyNumber && !isCoach && (
                  <div className="text-xs text-muted-foreground">
                    #{player.jerseyNumber}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {activePlayers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Inga aktiva spelare tillgängliga
        </div>
      )}
    </div>
  );
}

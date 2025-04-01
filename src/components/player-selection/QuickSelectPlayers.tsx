
import React from "react";
import { Player } from "@/types/player";
import { Badge } from "@/components/ui/badge";

interface QuickSelectPlayersProps {
  availablePlayers: Player[];
  onSelectPlayer: (playerId: string) => void;
  maxDisplay?: number;
}

export function QuickSelectPlayers({
  availablePlayers,
  onSelectPlayer,
  maxDisplay = 5
}: QuickSelectPlayersProps) {
  if (availablePlayers.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium mb-2">Snabbval:</h4>
      <div className="flex flex-wrap gap-2">
        {availablePlayers.slice(0, maxDisplay).map(player => (
          <Badge 
            key={player.id} 
            variant="outline" 
            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
            onClick={() => onSelectPlayer(player.id)}
          >
            {player.name}
          </Badge>
        ))}
        {availablePlayers.length > maxDisplay && (
          <Badge variant="outline" className="bg-muted">
            +{availablePlayers.length - maxDisplay} fler
          </Badge>
        )}
      </div>
    </div>
  );
}

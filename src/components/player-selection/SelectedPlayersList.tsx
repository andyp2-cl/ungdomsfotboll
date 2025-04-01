
import React from "react";
import { Player } from "@/types/player";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SelectedPlayersListProps {
  selectedPlayerIds: string[];
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
}

export function SelectedPlayersList({
  selectedPlayerIds,
  players,
  onRemovePlayer
}: SelectedPlayersListProps) {
  if (selectedPlayerIds.length === 0) {
    return null;
  }

  const getPlayerById = (id: string) => {
    return players.find(player => player.id === id);
  };

  return (
    <div className="p-3 border rounded-md mt-2">
      <h4 className="text-sm font-medium mb-2">Valda spelare:</h4>
      <div className="flex flex-wrap gap-2">
        {selectedPlayerIds.map(id => {
          const player = getPlayerById(id);
          return player ? (
            <Badge 
              key={id} 
              variant="secondary"
              className="flex items-center gap-1 p-1.5"
            >
              {player.name}
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-4 w-4 ml-1 hover:bg-muted"
                onClick={() => onRemovePlayer(id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ) : null;
        })}
      </div>
    </div>
  );
}

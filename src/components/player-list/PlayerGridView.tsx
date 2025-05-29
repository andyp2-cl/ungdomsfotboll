
import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerCard } from "@/components/player-ui/PlayerCard";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";

interface PlayerGridViewProps {
  players: Player[];
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  activities?: Activity[];
}

export function PlayerGridView({ 
  players, 
  onPlayerSelect, 
  onPlayerEdit,
  activities = []
}: PlayerGridViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onSelect={() => onPlayerSelect(player)}
          activities={activities}
          action={
            onPlayerEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlayerEdit(player);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )
          }
        />
      ))}
    </div>
  );
}

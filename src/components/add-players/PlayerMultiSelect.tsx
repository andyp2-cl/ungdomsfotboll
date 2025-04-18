
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PlayerAvatar } from "@/components/player-selection/PlayerAvatar";
import { PlayerMultiSelectDropdown } from "@/components/player-selection/PlayerMultiSelectDropdown";

interface PlayerMultiSelectProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  selectedPlayers: Player[];
  onAddPlayers: () => void;
}

export function PlayerMultiSelect({
  availablePlayers,
  selectedPlayerIds,
  onPlayerToggle,
  selectedPlayers,
  onAddPlayers
}: PlayerMultiSelectProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-2">
        <label className="text-sm font-medium">Välj flera spelare</label>
        <PlayerMultiSelectDropdown 
          availablePlayers={availablePlayers}
          selectedPlayers={selectedPlayerIds}
          onPlayerToggle={onPlayerToggle}
          maxSelections={50}
        />
      </div>
      
      {selectedPlayerIds.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
          {selectedPlayers.map(player => (
            <div 
              key={player.id}
              className="flex items-center gap-1 bg-background border rounded-full px-2 py-1 text-sm"
            >
              <PlayerAvatar player={player} size="xs" />
              <span className="truncate max-w-[100px]">{player.name}</span>
            </div>
          ))}
        </div>
      )}
      
      <Button 
        onClick={onAddPlayers}
        disabled={selectedPlayerIds.length === 0}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Lägg till {selectedPlayerIds.length} spelare
      </Button>
    </div>
  );
}


import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";

interface PlayerMultiSelectProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  selectedPlayers: Player[];
  onAddPlayers: () => void;
  isProcessing?: boolean;
}

export function PlayerMultiSelect({
  availablePlayers,
  selectedPlayerIds,
  onPlayerToggle,
  selectedPlayers,
  onAddPlayers,
  isProcessing = false
}: PlayerMultiSelectProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Välj spelare att lägga till</h4>
      
      <div className="border rounded-md p-2 h-48 overflow-y-auto">
        <div className="space-y-1">
          {availablePlayers.map(player => (
            <div key={player.id} className="flex items-center space-x-2 p-1 hover:bg-accent">
              <Checkbox 
                checked={selectedPlayerIds.includes(player.id)} 
                onCheckedChange={() => onPlayerToggle(player.id)}
                id={`player-${player.id}`}
              />
              <label 
                htmlFor={`player-${player.id}`} 
                className="text-sm flex-grow cursor-pointer"
              >
                {player.name}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      {selectedPlayers.length > 0 && (
        <div className="p-2 border rounded-md bg-muted/50">
          <p className="text-sm font-medium">Valda spelare ({selectedPlayers.length}):</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedPlayers.map(player => (
              <div key={player.id} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                {player.name}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Button 
        onClick={onAddPlayers} 
        disabled={selectedPlayerIds.length === 0 || isProcessing}
        variant="default" 
        className="w-full"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Plus className="h-4 w-4 mr-2" />
        )}
        Lägg till {selectedPlayerIds.length} spelare
      </Button>
    </div>
  );
}

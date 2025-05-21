
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerMultiSelectProps {
  availablePlayers: Player[];
  selectedPlayerIds: string[];
  onPlayerToggle: (playerId: string) => void;
  selectedPlayers: Player[];
  onAddPlayers: () => void;
  isProcessing?: boolean;
  isMobile?: boolean;
}

export function PlayerMultiSelect({
  availablePlayers,
  selectedPlayerIds,
  onPlayerToggle,
  selectedPlayers,
  onAddPlayers,
  isProcessing = false,
  isMobile = false
}: PlayerMultiSelectProps) {
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Välj spelare att lägga till</h4>
      
      <ScrollArea className={`border rounded-md p-2 ${isMobile ? 'h-36' : 'h-48'} overflow-y-auto`}>
        <div className="space-y-1">
          {availablePlayers.map(player => (
            <div 
              key={player.id} 
              className={`flex items-center space-x-2 p-1 hover:bg-accent ${isMobile ? 'py-2' : ''}`}
            >
              <Checkbox 
                checked={selectedPlayerIds.includes(player.id)} 
                onCheckedChange={() => onPlayerToggle(player.id)}
                id={`player-${player.id}`}
                className={isMobile ? "h-5 w-5" : ""}
              />
              <label 
                htmlFor={`player-${player.id}`} 
                className={`${isMobile ? 'text-base' : 'text-sm'} flex-grow cursor-pointer`}
              >
                {player.name}
              </label>
            </div>
          ))}
        </div>
      </ScrollArea>
      
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
        className={`w-full ${isMobile ? 'h-12 text-base' : ''}`}
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

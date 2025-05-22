
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
    <div className="space-y-3">
      <h4 className="text-sm font-medium">Välj spelare att lägga till</h4>
      
      <div className="border rounded-md p-2 h-48 overflow-y-auto">
        <div className="space-y-1">
          {availablePlayers.map(player => (
            <div key={player.id} className="flex items-center space-x-2 p-1.5 hover:bg-accent rounded-md">
              <Checkbox 
                checked={selectedPlayerIds.includes(player.id)} 
                onCheckedChange={() => onPlayerToggle(player.id)}
                id={`player-${player.id}`}
                className="mr-1"
              />
              <Avatar className="h-8 w-8 mr-2">
                <AvatarImage src={player.image} alt={player.name} />
                <AvatarFallback className="bg-muted">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor={`player-${player.id}`} 
                className="flex-grow cursor-pointer"
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
        className="w-full sticky bottom-0"
        size="lg"
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

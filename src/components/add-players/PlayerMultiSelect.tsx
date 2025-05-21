
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
      
      <ScrollArea className={`border rounded-md p-2 ${isMobile ? 'h-56' : 'h-48'} overflow-y-auto`}>
        <div className="space-y-2">
          {availablePlayers.map(player => (
            <div 
              key={player.id} 
              className={`flex items-center space-x-2 p-2 ${isMobile ? 'py-3' : 'py-1'} hover:bg-accent rounded-md`}
              onClick={() => onPlayerToggle(player.id)}
            >
              <Checkbox 
                checked={selectedPlayerIds.includes(player.id)} 
                onCheckedChange={() => onPlayerToggle(player.id)}
                id={`player-${player.id}`}
                className={isMobile ? "h-5 w-5" : ""}
              />
              <Avatar className={`${isMobile ? 'h-8 w-8' : 'h-6 w-6'} ml-1`}>
                <AvatarImage src={player.image} alt={player.name} />
                <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
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
        <div className="p-3 border rounded-md bg-muted/50">
          <p className="text-sm font-medium mb-2">Valda spelare ({selectedPlayers.length}):</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {selectedPlayers.map(player => (
              <div key={player.id} className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full flex items-center">
                {player.name}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="ml-1 p-0 h-4 w-4 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayerToggle(player.id);
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <Button 
        onClick={onAddPlayers} 
        disabled={selectedPlayerIds.length === 0 || isProcessing}
        variant="default" 
        className={`w-full ${isMobile ? 'h-14 text-base mt-4' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
        ) : (
          <Plus className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} mr-2`} />
        )}
        Lägg till {selectedPlayerIds.length} spelare
      </Button>
    </div>
  );
}

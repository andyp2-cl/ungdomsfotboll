
import React, { useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "./player-selection/PlayerAvatar";
import { toast } from "@/hooks/use-toast";
import { PlayerMultiSelectDropdown } from "./player-selection/PlayerMultiSelectDropdown";

interface AddPlayersToActivityProps {
  activity: Activity;
  players: Player[];
  onAddPlayers: (playerIds: string[]) => void;
  currentParticipantIds: string[];
}

export function AddPlayersToActivity({ 
  activity, 
  players, 
  onAddPlayers, 
  currentParticipantIds 
}: AddPlayersToActivityProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = players
    .filter(player => !currentParticipantIds.includes(player.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Get selected players data
  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );
  
  // Toggle player selection
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const handleAddPlayers = () => {
    if (selectedPlayerIds.length === 0) return;
    
    // Check if adding these players would exceed the player limit
    if (currentParticipantIds.length + selectedPlayerIds.length > 12) {
      toast({
        title: "Max antal spelare",
        description: "Du kan inte lägga till fler än 12 spelare till en aktivitet.",
        variant: "destructive"
      });
      return;
    }
    
    onAddPlayers(selectedPlayerIds);
    setSelectedPlayerIds([]);
  };
  
  const handleQuickSelect = (playerId: string) => {
    // Check if adding this player would exceed the player limit
    if (currentParticipantIds.length >= 12) {
      toast({
        title: "Max antal spelare",
        description: "Du kan inte lägga till fler än 12 spelare till en aktivitet.",
        variant: "destructive"
      });
      return;
    }
    
    onAddPlayers([playerId]);
  };
  
  // If no available players, show a message
  if (availablePlayers.length === 0) {
    return (
      <div className="text-muted-foreground text-sm mt-4">
        Alla spelare är redan tillagda i denna aktivitet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Välj flera spelare (max 10)</label>
          <PlayerMultiSelectDropdown 
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayerIds}
            onPlayerToggle={handlePlayerToggle}
            maxSelections={10}
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
          onClick={handleAddPlayers}
          disabled={selectedPlayerIds.length === 0}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till {selectedPlayerIds.length} spelare
        </Button>
      </div>
      
      {availablePlayers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Snabbval:</h4>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.slice(0, 8).map(player => (
              <Button 
                key={player.id}
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSelect(player.id)}
                className="flex items-center gap-2"
              >
                <PlayerAvatar player={player} size="sm" />
                <span className="truncate max-w-[100px]">{player.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

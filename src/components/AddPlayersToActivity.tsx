
import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "./player-selection/PlayerAvatar";
import { toast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = players
    .filter(player => !currentParticipantIds.includes(player.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  const handleAddPlayer = () => {
    if (!selectedPlayerId) return;
    
    // Check if adding this player would exceed the player limit
    if (currentParticipantIds.length >= 12) {
      toast({
        title: "Max antal spelare",
        description: "Du kan inte lägga till fler än 12 spelare till en aktivitet.",
        variant: "destructive"
      });
      return;
    }
    
    onAddPlayers([selectedPlayerId]);
    setSelectedPlayerId("");
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
      <div className="flex flex-col sm:flex-row gap-3">
        <Select 
          value={selectedPlayerId} 
          onValueChange={setSelectedPlayerId}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Välj spelare" />
          </SelectTrigger>
          <SelectContent>
            {availablePlayers.map(player => (
              <SelectItem key={player.id} value={player.id}>
                {player.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Button 
          onClick={handleAddPlayer}
          disabled={!selectedPlayerId}
          className="w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till spelare
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
                onClick={() => onAddPlayers([player.id])}
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

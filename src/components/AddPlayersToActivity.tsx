
import React, { useState, useMemo } from "react";
import { Player, Activity } from "@/types/player";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Check, UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";

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
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = useMemo(() => {
    return players
      .filter(player => !currentParticipantIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, currentParticipantIds]);

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      setSelectedPlayers(prev => prev.filter(id => id !== playerId));
    } else {
      // Check if adding this player would exceed the 12 player limit
      if (currentParticipantIds.length + selectedPlayers.length >= 12) {
        toast({
          title: "Max antal spelare",
          description: "Du kan inte lägga till fler än 12 spelare till en aktivitet.",
          variant: "destructive"
        });
        return;
      }
      setSelectedPlayers(prev => [...prev, playerId]);
    }
  };

  const handleAddPlayers = () => {
    if (selectedPlayers.length > 0) {
      onAddPlayers(selectedPlayers);
      setSelectedPlayers([]);
    }
  };

  const handleSinglePlayerAdd = (playerId: string) => {
    // Check if adding this player would exceed the 12 player limit
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

  const getPlayerById = (id: string) => {
    return players.find(player => player.id === id);
  };

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Select 
          onValueChange={handlePlayerSelect}
          value=""
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Välj spelare" />
          </SelectTrigger>
          <SelectContent>
            <ScrollArea className="h-[200px]">
              {availablePlayers.length > 0 ? (
                availablePlayers.map((player) => (
                  <SelectItem 
                    key={player.id} 
                    value={player.id}
                    disabled={currentParticipantIds.length + selectedPlayers.length >= 12 && !selectedPlayers.includes(player.id)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{player.name}</span>
                      {selectedPlayers.includes(player.id) && <Check className="h-4 w-4 ml-2" />}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="empty" disabled>
                  Inga tillgängliga spelare
                </SelectItem>
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
        
        <Button 
          onClick={handleAddPlayers} 
          disabled={selectedPlayers.length === 0}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Lägg till {selectedPlayers.length > 0 ? `(${selectedPlayers.length})` : ""}
        </Button>
      </div>

      {selectedPlayers.length > 0 && (
        <div className="p-3 border rounded-md mt-2">
          <h4 className="text-sm font-medium mb-2">Valda spelare:</h4>
          <div className="flex flex-wrap gap-2">
            {selectedPlayers.map(id => {
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
                    onClick={() => handlePlayerSelect(id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}

      {availablePlayers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Snabbval:</h4>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.slice(0, 5).map(player => (
              <Badge 
                key={player.id} 
                variant="outline" 
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-1"
                onClick={() => handleSinglePlayerAdd(player.id)}
              >
                {player.name}
              </Badge>
            ))}
            {availablePlayers.length > 5 && (
              <Badge variant="outline" className="bg-muted">
                +{availablePlayers.length - 5} fler
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

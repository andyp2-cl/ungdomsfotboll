
import React, { useState, useMemo, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = useMemo(() => {
    return players
      .filter(player => !currentParticipantIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, currentParticipantIds]);

  // Filter available players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return availablePlayers;
    
    return availablePlayers.filter(player => 
      player.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availablePlayers, searchQuery]);

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
      setSearchQuery("");
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

  // Debug section
  useEffect(() => {
    console.log("Search query:", searchQuery);
    console.log("Filtered players:", filteredPlayers.map(p => p.name));
  }, [searchQuery, filteredPlayers]);

  return (
    <div className="space-y-4 mt-4">
      <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              role="combobox" 
              aria-expanded={popoverOpen}
              className="w-full sm:w-[200px] justify-between"
            >
              Välj spelare
              <X 
                className="h-4 w-4 shrink-0 opacity-50 ml-2" 
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchQuery("");
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command>
              <CommandInput 
                placeholder="Sök spelare..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>Inga spelare hittades</CommandEmpty>
                <CommandGroup className="max-h-[200px] overflow-auto">
                  {filteredPlayers.map((player) => (
                    <CommandItem
                      key={player.id}
                      value={player.id}
                      onSelect={(value) => {
                        handlePlayerSelect(value);
                      }}
                      disabled={currentParticipantIds.length + selectedPlayers.length >= 12 && !selectedPlayers.includes(player.id)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>{player.name}</span>
                        {selectedPlayers.includes(player.id) && <X className="h-4 w-4 ml-2" />}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        
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

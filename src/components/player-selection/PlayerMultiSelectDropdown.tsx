
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { Check, Plus, X } from "lucide-react";

interface PlayerMultiSelectDropdownProps {
  players: Player[];
  selectedPlayerIds: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  excludePlayerIds?: string[];
  placeholder?: string;
  maxHeight?: string;
}

export function PlayerMultiSelectDropdown({
  players,
  selectedPlayerIds,
  onSelectionChange,
  excludePlayerIds = [],
  placeholder = "Välj spelare...",
  maxHeight = "300px"
}: PlayerMultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const availablePlayers = players.filter(player => 
    !excludePlayerIds.includes(player.id)
  );

  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );

  const handlePlayerToggle = (playerId: string) => {
    const newSelection = selectedPlayerIds.includes(playerId)
      ? selectedPlayerIds.filter(id => id !== playerId)
      : [...selectedPlayerIds, playerId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allAvailableIds = filteredPlayers.map(p => p.id);
    const newSelection = [...new Set([...selectedPlayerIds, ...allAvailableIds])];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removePlayer = (playerId: string) => {
    onSelectionChange(selectedPlayerIds.filter(id => id !== playerId));
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {selectedPlayerIds.length > 0 
              ? `${selectedPlayerIds.length} spelare valda`
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Sök spelare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredPlayers.length === 0}
              >
                Välj alla
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedPlayerIds.length === 0}
              >
                Rensa alla
              </Button>
            </div>
          </div>
          <ScrollArea style={{ maxHeight }}>
            <div className="p-2">
              {filteredPlayers.map(player => (
                <div
                  key={player.id}
                  className="flex items-center space-x-2 py-2 px-2 hover:bg-accent rounded cursor-pointer"
                  onClick={() => handlePlayerToggle(player.id)}
                >
                  <Checkbox
                    checked={selectedPlayerIds.includes(player.id)}
                    onChange={() => handlePlayerToggle(player.id)}
                  />
                  <div className="flex-1">
                    <div className="font-medium">{player.name}</div>
                    {player.grade && (
                      <div className="text-sm text-muted-foreground">
                        Nivå: {player.grade}
                      </div>
                    )}
                  </div>
                  {selectedPlayerIds.includes(player.id) && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                </div>
              ))}
              {filteredPlayers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  Inga spelare hittades
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      {selectedPlayers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedPlayers.map(player => (
            <Badge
              key={player.id}
              variant="secondary"
              className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
            >
              {player.name}
              <X 
                className="h-3 w-3 ml-1" 
                onClick={() => removePlayer(player.id)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

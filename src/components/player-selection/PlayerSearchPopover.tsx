
import React, { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";

interface PlayerSearchPopoverProps {
  availablePlayers: Player[];
  selectedPlayers: string[];
  onPlayerSelect: (playerId: string) => void;
  currentParticipantCount: number;
  maxParticipants?: number;
}

export function PlayerSearchPopover({
  availablePlayers,
  selectedPlayers,
  onPlayerSelect,
  currentParticipantCount,
  maxParticipants = 999 // Changed from 12 to 999 to effectively remove the limit
}: PlayerSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Filter available players based on search query
  const filteredPlayers = availablePlayers.filter(player => {
    if (!searchQuery.trim()) return true;
    return player.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onPlayerSelect(playerId);
    } else {
      // No player limit check anymore
      onPlayerSelect(playerId);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="w-full sm:w-[200px] justify-between"
        >
          <span className="truncate">
            {selectedPlayers.length > 0 
              ? `${selectedPlayers.length} valda` 
              : "Välj spelare"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput 
            placeholder="Sök spelare..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>Inga spelare hittades</CommandEmpty>
            <CommandGroup>
              {filteredPlayers.map((player) => (
                <CommandItem
                  key={player.id}
                  value={player.id}
                  onSelect={() => handlePlayerSelect(player.id)}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>{player.name}</span>
                  </div>
                  {selectedPlayers.includes(player.id) && (
                    <Check className="h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

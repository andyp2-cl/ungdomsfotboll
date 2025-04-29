import React, { useState, useEffect, useRef } from "react";
import { Player } from "@/types/player";
import { Check, ChevronsUpDown, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [highlightedPlayerId, setHighlightedPlayerId] = useState<string | null>(null);
  const isMobile = useIsMobile();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Filter available players based on search query
  const filteredPlayers = availablePlayers.filter(player => {
    if (!searchQuery.trim()) return true;
    return player.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Reset search when popover closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHighlightedPlayerId(null);
    } else {
      // Focus the input when the popover opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery && filteredPlayers.length > 0) {
      // If we have a highlighted player, select that player
      if (highlightedPlayerId) {
        handlePlayerSelect(highlightedPlayerId);
      } else {
        // Otherwise select the first player in the filtered list
        handlePlayerSelect(filteredPlayers[0].id);
      }
      e.preventDefault();
    }
  };

  const handlePlayerSelect = (playerId: string) => {
    if (selectedPlayers.includes(playerId)) {
      onPlayerSelect(playerId);
    } else {
      // No player limit check anymore
      onPlayerSelect(playerId);
    }
    // Close the popover and reset search after selection
    setOpen(false);
    setSearchQuery("");
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
      <PopoverContent className={`${isMobile ? 'w-[calc(100vw-2rem)]' : 'w-[250px]'} p-0`} align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Sök spelare..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            ref={inputRef}
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
                  onMouseEnter={() => setHighlightedPlayerId(player.id)}
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

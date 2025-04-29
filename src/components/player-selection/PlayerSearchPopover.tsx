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

  // Reset search when popover closes or opens
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setHighlightedPlayerId(null);
    } else {
      // Focus the input when the popover opens
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 10);
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredPlayers.length > 0) {
      e.preventDefault(); // Prevent form submission
      
      // If we have a highlighted player, select that player
      if (highlightedPlayerId && filteredPlayers.some(p => p.id === highlightedPlayerId)) {
        handlePlayerSelect(highlightedPlayerId, true);
      } else if (filteredPlayers.length > 0) {
        // Otherwise select the first player in the filtered list
        handlePlayerSelect(filteredPlayers[0].id, true);
      }
    }
  };

  const handlePlayerSelect = (playerId: string, keepOpen = true) => {
    if (selectedPlayers.includes(playerId)) {
      onPlayerSelect(playerId);
    } else {
      // No player limit check anymore
      onPlayerSelect(playerId);
    }
    
    // Always clear search query and keep popover open
    setSearchQuery("");
    
    // Refocus the input field for the next search
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 10);
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

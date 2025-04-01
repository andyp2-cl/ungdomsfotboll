
import React, { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { X } from "lucide-react";
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
  maxParticipants = 12
}: PlayerSearchPopoverProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Fix: Corrected filtering logic to properly handle case-insensitive search
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
      // Check if adding this player would exceed the player limit
      if (currentParticipantCount + selectedPlayers.length >= maxParticipants) {
        toast({
          title: "Max antal spelare",
          description: `Du kan inte lägga till fler än ${maxParticipants} spelare till en aktivitet.`,
          variant: "destructive"
        });
        return;
      }
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
                    setOpen(false); // Close popover after selection
                  }}
                  disabled={currentParticipantCount + selectedPlayers.length >= maxParticipants && !selectedPlayers.includes(player.id)}
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
  );
}

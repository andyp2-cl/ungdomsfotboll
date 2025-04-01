
import React, { useState, useEffect } from "react";
import { Player } from "@/types/player";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PlayerMultiSelectDropdownProps {
  availablePlayers: Player[];
  selectedPlayers: string[];
  onPlayerToggle: (playerId: string) => void;
  maxSelections?: number;
}

export function PlayerMultiSelectDropdown({
  availablePlayers,
  selectedPlayers,
  onPlayerToggle,
  maxSelections = 10
}: PlayerMultiSelectDropdownProps) {
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
  
  // Check if maximum selections reached
  const isMaxReached = selectedPlayers.length >= maxSelections;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          role="combobox" 
          aria-expanded={open}
          className="w-full justify-between"
        >
          <span className="truncate">
            {selectedPlayers.length > 0 
              ? `${selectedPlayers.length} spelare valda` 
              : "Välj spelare"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Sök spelare..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList className="max-h-[300px] overflow-auto">
            <CommandEmpty>Inga spelare hittades</CommandEmpty>
            <CommandGroup>
              {filteredPlayers.map((player) => {
                const isSelected = selectedPlayers.includes(player.id);
                return (
                  <CommandItem
                    key={player.id}
                    value={player.id}
                    onSelect={() => {
                      // Allow deselecting even if max reached
                      if (isSelected || !isMaxReached) {
                        onPlayerToggle(player.id);
                      }
                    }}
                    disabled={!isSelected && isMaxReached}
                    className={cn(
                      "flex items-center justify-between cursor-pointer",
                      !isSelected && isMaxReached && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>{player.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4" />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}


import React, { useState, Dispatch, SetStateAction, useRef } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash, Search } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantActionsProps {
  // Original props for popup usage
  activity?: Activity;
  nonParticipantPlayers?: Player[];
  onAddParticipant?: (playerId: string) => void;
  onAddPlayers?: (playerIds: string[]) => void; // Added this prop for bulk additions
  
  // Alternative props for direct button usage
  participantCount?: number; 
  isAddingPlayers?: boolean;
  setIsAddingPlayers?: Dispatch<SetStateAction<boolean>>;
  onClearAllParticipants?: () => void;
  
  // Common props
  isMobile?: boolean;
}

export function ParticipantActions({ 
  // Original props
  activity, 
  nonParticipantPlayers = [], 
  onAddParticipant,
  onAddPlayers,
  
  // Alternative props
  participantCount,
  isAddingPlayers,
  setIsAddingPlayers,
  onClearAllParticipants,
  
  // Common props
  isMobile = false
}: ParticipantActionsProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  
  // If we're in the alternative usage mode (with participantCount)
  if (participantCount !== undefined && setIsAddingPlayers) {
    return (
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
        <Button 
          variant="outline" 
          onClick={() => setIsAddingPlayers(true)}
          size={isMobile ? "sm" : "default"}
          className={isMobile ? "text-sm" : ""}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Lägg till spelare
        </Button>
        
        {participantCount > 0 && onClearAllParticipants && (
          <Button 
            variant="outline" 
            onClick={onClearAllParticipants}
            size={isMobile ? "sm" : "default"}
            className={`${isMobile ? "text-sm" : ""} text-destructive hover:text-destructive`}
          >
            <Trash className="h-4 w-4 mr-2" />
            Rensa alla
          </Button>
        )}
      </div>
    );
  }
  
  // Filter players based on search query
  const filteredPlayers = nonParticipantPlayers.filter(player => {
    if (!searchQuery.trim()) return true;
    return player.name.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Handle the participant selection
  const handleSelectParticipant = (playerId: string) => {
    if (onAddParticipant) {
      onAddParticipant(playerId);
    } else if (onAddPlayers) {
      // If we have onAddPlayers, use it with a single-item array
      onAddPlayers([playerId]);
    }
    setOpen(false);
    setSearchQuery("");
  };
  
  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery && filteredPlayers.length > 0) {
      // Select the first player in the filtered list
      handleSelectParticipant(filteredPlayers[0].id);
      e.preventDefault();
    }
  };

  // Focus input when popover opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
    }
  }, [open]);
  
  // Original implementation with popup
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size={isMobile ? "sm" : "default"} className={isMobile ? "w-full" : ""}>
          <UserPlus className="h-4 w-4 mr-2" />
          Lägg till spelare
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" side="bottom" align="end">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Sök spelare..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            onKeyDown={handleKeyDown}
            ref={inputRef}
          />
          <CommandEmpty>Inga spelare hittades</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {filteredPlayers.map(player => (
              <CommandItem
                key={player.id}
                onSelect={() => handleSelectParticipant(player.id)}
                className="cursor-pointer"
              >
                <Avatar className="h-6 w-6 mr-2">
                  <AvatarImage src={player.image} alt={player.name} />
                  <AvatarFallback className="text-xs">
                    {player.name?.split(" ").map(n => n[0]).join("") || "?"}
                  </AvatarFallback>
                </Avatar>
                <span>{player.name}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// Add missing useEffect import
import { useEffect } from "react";


import React, { useState, Dispatch, SetStateAction } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { UserPlus, Trash } from "lucide-react";
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
  
  // Handle the participant selection
  const handleSelectParticipant = (playerId: string) => {
    if (onAddParticipant) {
      onAddParticipant(playerId);
    } else if (onAddPlayers) {
      // If we have onAddPlayers, use it with a single-item array
      onAddPlayers([playerId]);
    }
    setOpen(false);
  };
  
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
        <Command>
          <CommandInput placeholder="Sök spelare..." />
          <CommandEmpty>Inga spelare hittades</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {nonParticipantPlayers.map(player => (
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


import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Plus, UserPlus } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ParticipantActionsProps {
  activity: Activity;
  nonParticipantPlayers: Player[];
  onAddParticipant: (playerId: string) => void;
  isMobile?: boolean;
}

export function ParticipantActions({ 
  activity, 
  nonParticipantPlayers, 
  onAddParticipant,
  isMobile = false
}: ParticipantActionsProps) {
  const [open, setOpen] = useState(false);
  
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
                onSelect={() => {
                  onAddParticipant(player.id);
                  setOpen(false);
                }}
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

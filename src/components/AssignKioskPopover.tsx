
import { useState } from "react";
import { Player } from "@/types/player";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { UserPlus, Check } from "lucide-react";

interface AssignKioskPopoverProps {
  players: Player[];
  slotId: string;
  onAssignPlayer: (slotId: string, playerId: string) => void;
  currentAssignedId?: string;
}

export function AssignKioskPopover({ 
  players, 
  slotId, 
  onAssignPlayer,
  currentAssignedId
}: AssignKioskPopoverProps) {
  const [open, setOpen] = useState(false);
  
  const handleSelect = (playerId: string) => {
    onAssignPlayer(slotId, playerId);
    setOpen(false);
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-7 w-7 p-0" 
          aria-label="Tilldela spelare"
        >
          <UserPlus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="end" side="top">
        <Command>
          <CommandInput placeholder="Sök spelare..." />
          <CommandEmpty>Inga spelare hittades.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-auto">
            {players.map((player) => (
              <CommandItem
                key={player.id}
                onSelect={() => handleSelect(player.id)}
                className="flex items-center justify-between"
              >
                <span>{player.name}</span>
                {player.id === currentAssignedId && (
                  <Check className="h-4 w-4" />
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

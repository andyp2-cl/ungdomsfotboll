
import React, { useState } from "react";
import { Activity, Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coffee, UserPlus, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

interface ActivityKioskAssignmentProps {
  activity: Activity;
  players: Player[];
  updateActivity: (updatedActivity: Activity) => void;
  onKioskAssignmentUpdate: (activityId: string, playerId?: string) => Promise<boolean>;
}

export function ActivityKioskAssignment({ 
  activity, 
  players, 
  updateActivity,
  onKioskAssignmentUpdate
}: ActivityKioskAssignmentProps) {
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  
  // Sort players alphabetically for the popover
  const sortedPlayers = [...players].sort((a, b) => a.name.localeCompare(b.name));
  
  // Filter players based on search query
  const filteredPlayers = playerSearchQuery 
    ? sortedPlayers.filter(player => 
        player.name.toLowerCase().includes(playerSearchQuery.toLowerCase())
      )
    : sortedPlayers;
  
  const isHomeMatch = () => {
    return activity.name.toLowerCase().startsWith('hässleholms if');
  };

  const getKioskPlayerName = () => {
    if (!activity.kioskAssignedPlayerId) return "Ej tilldelad";
    const player = players.find(p => p.id === activity.kioskAssignedPlayerId);
    return player ? player.name : "Okänd spelare";
  };

  const handleAssignKioskPlayer = async (playerId: string) => {
    const updatedActivity = {
      ...activity,
      kioskAssignedPlayerId: playerId
    };
    
    updateActivity(updatedActivity);
    
    // Also update through the provided update function
    await onKioskAssignmentUpdate(activity.id, playerId);
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold flex items-center mb-3">
        <Coffee className="h-5 w-5 mr-2" />
        Kioskansvarig
        {isHomeMatch() && (
          <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 border-green-300">
            Hemmaplan
          </Badge>
        )}
      </h3>
      
      <div className="flex justify-between items-center">
        <Badge variant={activity.kioskAssignedPlayerId ? "default" : "outline"} className="mr-2">
          {getKioskPlayerName()}
        </Badge>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="outline"
              size="sm" 
              className="h-8 px-3"
            >
              {activity.kioskAssignedPlayerId ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Ändra
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-1" />
                  Tilldela
                </>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="end" side="top">
            <Command>
              <CommandInput 
                placeholder="Sök spelare..." 
                value={playerSearchQuery}
                onValueChange={setPlayerSearchQuery}
              />
              <CommandList>
                <CommandEmpty>Inga spelare hittades.</CommandEmpty>
                <CommandGroup className="max-h-60 overflow-auto">
                  {filteredPlayers.map((player) => (
                    <CommandItem
                      key={player.id}
                      onSelect={() => handleAssignKioskPlayer(player.id)}
                      className="flex items-center justify-between"
                    >
                      <span>{player.name}</span>
                      {player.id === activity.kioskAssignedPlayerId && (
                        <Check className="h-4 w-4" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

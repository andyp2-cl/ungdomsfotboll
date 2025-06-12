import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Player } from "@/types/player";
import { Check, Plus, X } from "lucide-react";
import { getWeeklyMatchCountForActivity } from "@/utils/weeklyMatchUtils";

interface PlayerMultiSelectDropdownProps {
  players: Player[];
  selectedPlayerIds: string[];
  onSelectionChange: (playerIds: string[]) => void;
  excludePlayerIds?: string[];
  placeholder?: string;
  maxHeight?: string;
  allActivities?: any[]; // For calculating weekly match counts
  currentActivity?: any; // Current activity to determine if it's upcoming
}

export function PlayerMultiSelectDropdown({
  players,
  selectedPlayerIds,
  onSelectionChange,
  excludePlayerIds = [],
  placeholder = "Välj spelare...",
  maxHeight = "300px",
  allActivities = [],
  currentActivity
}: PlayerMultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Sort players by grade (A, B, C, D) and then by training ratio
  const sortedPlayers = [...players].sort((a, b) => {
    // First sort by grade
    const gradeOrder = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    const gradeA = a.grade || 'D';
    const gradeB = b.grade || 'D';
    
    if (gradeOrder[gradeA] !== gradeOrder[gradeB]) {
      return gradeOrder[gradeA] - gradeOrder[gradeB];
    }
    
    // Then sort by training ratio (higher value first)
    const ratioA = a.trainingRatio || 0;
    const ratioB = b.trainingRatio || 0;
    return ratioB - ratioA;
  });

  const availablePlayers = sortedPlayers.filter(player => 
    !excludePlayerIds.includes(player.id)
  );

  const filteredPlayers = availablePlayers.filter(player =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );

  const handlePlayerToggle = (playerId: string) => {
    const newSelection = selectedPlayerIds.includes(playerId)
      ? selectedPlayerIds.filter(id => id !== playerId)
      : [...selectedPlayerIds, playerId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    const allAvailableIds = filteredPlayers.map(p => p.id);
    const newSelection = [...new Set([...selectedPlayerIds, ...allAvailableIds])];
    onSelectionChange(newSelection);
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const removePlayer = (playerId: string) => {
    onSelectionChange(selectedPlayerIds.filter(id => id !== playerId));
  };

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {selectedPlayerIds.length > 0 
              ? `${selectedPlayerIds.length} spelare valda`
              : placeholder
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-3 border-b">
            <Input
              placeholder="Sök spelare..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-2"
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredPlayers.length === 0}
              >
                Välj alla
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedPlayerIds.length === 0}
              >
                Rensa alla
              </Button>
            </div>
          </div>
          <ScrollArea className="max-h-[300px]">
            <div className="p-2">
              {filteredPlayers.map(player => {
                // Calculate weekly match count if we have the necessary data
                let weeklyMatchCount = 0;
                if (allActivities.length > 0 && currentActivity) {
                  weeklyMatchCount = getWeeklyMatchCountForActivity(player.id, allActivities, currentActivity);
                }

                return (
                  <div key={player.id} className="flex items-center space-x-2 p-2 hover:bg-accent rounded-md">
                    <Checkbox 
                      checked={selectedPlayerIds.includes(player.id)}
                      onCheckedChange={() => handlePlayerToggle(player.id)}
                      id={`player-${player.id}`}
                    />
                    <label 
                      htmlFor={`player-${player.id}`}
                      className="flex-grow cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <span>{player.name}</span>
                        <div className="flex items-center gap-2">
                          {player.grade && (
                            <Badge variant="outline" className="text-xs">
                              {player.grade}
                            </Badge>
                          )}
                          {weeklyMatchCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Denna vecka {weeklyMatchCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
      {selectedPlayerIds.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedPlayers.map(player => (
            <Badge
              key={player.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              {player.name}
              <button
                onClick={() => removePlayer(player.id)}
                className="ml-1 hover:bg-accent rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

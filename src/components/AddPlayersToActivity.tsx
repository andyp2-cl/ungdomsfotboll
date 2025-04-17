
import React, { useState, useEffect } from "react";
import { Player, Activity } from "@/types/player";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "./player-selection/PlayerAvatar";
import { toast } from "@/hooks/use-toast";
import { PlayerMultiSelectDropdown } from "./player-selection/PlayerMultiSelectDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useQuery } from "@tanstack/react-query";
import { getStoredActivities } from "@/utils/storage/activity/fetch";
import { findMatchesByCupName } from "@/lib/supabase/activities";

interface AddPlayersToActivityProps {
  activity: Activity;
  players: Player[];
  onAddPlayers: (playerIds: string[]) => void;
  currentParticipantIds: string[];
}

export function AddPlayersToActivity({ 
  activity, 
  players, 
  onAddPlayers, 
  currentParticipantIds 
}: AddPlayersToActivityProps) {
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [selectedCup, setSelectedCup] = useState<string>("");
  const isMobile = useIsMobile();
  
  // Fetch all activities to get cups
  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: getStoredActivities,
  });
  
  // Get all cups from activities
  const cups = activities?.filter(act => act.type === "cup") || [];
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = players
    .filter(player => !currentParticipantIds.includes(player.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Get selected players data
  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );
  
  // Toggle player selection
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  // Handle cup selection
  const handleCupSelect = (cupId: string) => {
    setSelectedCup(cupId);
    
    if (cupId === "no-cup") {
      return;
    }
    
    // Find selected cup
    const selectedCupActivity = cups.find(cup => cup.id === cupId);
    
    if (selectedCupActivity && selectedCupActivity.participants && selectedCupActivity.participants.length > 0) {
      // Filter out participants that are already in the match
      const newParticipants = selectedCupActivity.participants.filter(
        participantId => !currentParticipantIds.includes(participantId)
      );
      
      if (newParticipants.length > 0) {
        // Add all cup participants to the match
        onAddPlayers(newParticipants);
        toast({
          title: "Deltagare tillagda",
          description: `${newParticipants.length} deltagare från ${selectedCupActivity.name} har lagts till.`,
        });
      } else {
        toast({
          title: "Inga nya deltagare",
          description: "Alla deltagare från denna cup är redan tillagda i matchen.",
        });
      }
    } else {
      toast({
        title: "Inga deltagare",
        description: "Den valda cupen har inga deltagare.",
      });
    }
  };
  
  const handleAddPlayers = () => {
    if (selectedPlayerIds.length === 0) return;
    
    onAddPlayers(selectedPlayerIds);
    setSelectedPlayerIds([]);
  };
  
  const handleQuickSelect = (playerId: string) => {
    onAddPlayers([playerId]);
  };
  
  // If no available players, show a message
  if (availablePlayers.length === 0) {
    return (
      <div className="text-muted-foreground text-sm mt-4">
        Alla spelare är redan tillagda i denna aktivitet.
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Cup selection */}
      {activity.type === "match" && cups.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="cup-select">Välj cup för att lägga till alla deltagare</Label>
          <Select 
            onValueChange={handleCupSelect} 
            value={selectedCup}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Välj en cup" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no-cup">Ingen cup</SelectItem>
              {cups.map((cup) => (
                <SelectItem key={cup.id} value={cup.id}>
                  {cup.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Välj flera spelare</label>
          <PlayerMultiSelectDropdown 
            availablePlayers={availablePlayers}
            selectedPlayers={selectedPlayerIds}
            onPlayerToggle={handlePlayerToggle}
            maxSelections={50} // Increased from 10 to 50 to effectively remove the limit
          />
        </div>
        
        {selectedPlayerIds.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 border rounded-md bg-muted/30">
            {selectedPlayers.map(player => (
              <div 
                key={player.id}
                className="flex items-center gap-1 bg-background border rounded-full px-2 py-1 text-sm"
              >
                <PlayerAvatar player={player} size="xs" />
                <span className="truncate max-w-[100px]">{player.name}</span>
              </div>
            ))}
          </div>
        )}
        
        <Button 
          onClick={handleAddPlayers}
          disabled={selectedPlayerIds.length === 0}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till {selectedPlayerIds.length} spelare
        </Button>
      </div>
      
      {availablePlayers.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Snabbval:</h4>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.slice(0, isMobile ? 4 : 8).map(player => (
              <Button 
                key={player.id}
                variant="outline" 
                size="sm"
                onClick={() => handleQuickSelect(player.id)}
                className="flex items-center gap-2"
              >
                <PlayerAvatar player={player} size="xs" />
                <span className="truncate max-w-[100px]">{player.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


import React, { useState } from "react";
import { Player, Activity } from "@/types/player";
import { CupSelector } from "./add-players/CupSelector";
import { PlayerMultiSelect } from "./add-players/PlayerMultiSelect";
import { PlayerQuickSelect } from "./add-players/PlayerQuickSelect";
import { toast } from "sonner";

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
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = players
    .filter(player => !currentParticipantIds.includes(player.id))
    .sort((a, b) => a.name.localeCompare(b.name));
  
  // Get selected players data
  const selectedPlayers = players.filter(player => 
    selectedPlayerIds.includes(player.id)
  );
  
  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };
  
  const handleAddPlayers = () => {
    if (selectedPlayerIds.length === 0) return;
    
    // Log before saving
    console.log(`Adding ${selectedPlayerIds.length} players to activity ${activity.id}`);
    
    try {
      onAddPlayers(selectedPlayerIds);
      setSelectedPlayerIds([]);
      
      toast.success(`${selectedPlayerIds.length} spelare tillagda`);
    } catch (error) {
      console.error("Error adding players to activity:", error);
      toast.error("Kunde inte lägga till spelare");
    }
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
      {/* Cup Selector - show for both match and cup types */}
      <CupSelector
        selectedCup={selectedCup}
        onCupSelect={setSelectedCup}
        currentParticipantIds={currentParticipantIds}
        onAddPlayers={onAddPlayers}
      />

      <PlayerMultiSelect
        availablePlayers={availablePlayers}
        selectedPlayerIds={selectedPlayerIds}
        onPlayerToggle={handlePlayerToggle}
        selectedPlayers={selectedPlayers}
        onAddPlayers={handleAddPlayers}
      />
      
      <PlayerQuickSelect
        availablePlayers={availablePlayers}
        onQuickSelect={(playerId) => {
          console.log("Quick selecting player:", playerId);
          onAddPlayers([playerId]);
        }}
      />
    </div>
  );
}

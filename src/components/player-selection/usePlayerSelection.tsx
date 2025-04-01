
import { useState, useMemo } from "react";
import { Player, Activity } from "@/types/player";
import { toast } from "@/hooks/use-toast";

interface UsePlayerSelectionProps {
  activity: Activity;
  players: Player[];
  currentParticipantIds: string[];
  onAddPlayers: (playerIds: string[]) => void;
}

export function usePlayerSelection({
  activity,
  players,
  currentParticipantIds,
  onAddPlayers
}: UsePlayerSelectionProps) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = useMemo(() => {
    return players
      .filter(player => !currentParticipantIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, currentParticipantIds]);

  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleAddPlayers = () => {
    if (selectedPlayers.length > 0) {
      onAddPlayers(selectedPlayers);
      setSelectedPlayers([]);
    }
  };

  const handleSinglePlayerAdd = (playerId: string) => {
    // Check if adding this player would exceed the 12 player limit
    if (currentParticipantIds.length >= 12) {
      toast({
        title: "Max antal spelare",
        description: "Du kan inte lägga till fler än 12 spelare till en aktivitet.",
        variant: "destructive"
      });
      return;
    }
    onAddPlayers([playerId]);
  };

  return {
    selectedPlayers,
    availablePlayers,
    handlePlayerSelect,
    handleAddPlayers,
    handleSinglePlayerAdd
  };
}

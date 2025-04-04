
import { useState, useMemo } from "react";
import { Player, Activity } from "@/types/player";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  // Filter out players who are already participating and sort alphabetically
  const availablePlayers = useMemo(() => {
    console.log("All players:", players.length);
    console.log("Current participant IDs:", currentParticipantIds);
    
    const filtered = players
      .filter(player => !currentParticipantIds.includes(player.id))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log("Available players after filtering:", filtered.length);
    return filtered;
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
    // No player limit check anymore
    onAddPlayers([playerId]);
  };

  return {
    selectedPlayers,
    availablePlayers,
    handlePlayerSelect,
    handleAddPlayers,
    handleSinglePlayerAdd,
    isMobile
  };
}

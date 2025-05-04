
import { useMemo } from "react";
import { usePlayerState } from "@/hooks/players/usePlayerState";
import { usePlayerFilters } from "@/hooks/players/usePlayerFilters";
import { usePlayerActions } from "@/hooks/players/usePlayerActions";
import { Player } from "@/types/player";

/**
 * Combines player state, filtering, and actions into one hook
 */
export function usePlayers() {
  // Get player state
  const playerState = usePlayerState();
  const { players, isLoading } = playerState;
  
  // Get player filters
  const playerFilters = usePlayerFilters({
    players,
    searchQuery: "",
    selectedPositions: [],
    selectedGrades: []
  });
  
  // Get player actions with updated player state
  const playerActions = usePlayerActions(playerState);
  
  // Combine all player state, filters and actions
  return {
    ...playerState,
    ...playerFilters,
    ...playerActions
  };
}

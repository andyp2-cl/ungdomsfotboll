
import { useMemo } from "react";
import { usePlayerState } from "@/hooks/players/usePlayerState";
import { usePlayerFilters } from "@/hooks/players/usePlayerFilters";
import { usePlayerActions } from "@/hooks/players/usePlayerActions";
import { Player, PlayerFilter } from "@/types/player";

/**
 * Combines player state, filtering, and actions into one hook
 */
export function usePlayers() {
  // Get player state
  const playerState = usePlayerState();
  const { players, isLoading } = playerState;
  
  // Get player filters with current player data
  const playerFilters = usePlayerFilters(players);
  const { filteredPlayers } = playerFilters;
  
  // Get player actions with updated player state
  const playerActions = usePlayerActions(playerState);
  
  return {
    ...playerState,
    ...playerFilters,
    ...playerActions,
    filteredPlayers
  };
}

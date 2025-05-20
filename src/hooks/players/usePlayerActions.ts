
import { Player } from "@/types/player";
import { usePlayerLoad } from "./actions/usePlayerLoad";
import { usePlayerUpdate } from "./actions/usePlayerUpdate";
import { usePlayerAdd } from "./actions/usePlayerAdd";
import { usePlayerDelete } from "./actions/usePlayerDelete";

export function usePlayerActions(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
  setIsAddPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  // Load players effect
  usePlayerLoad(setPlayers, setIsLoading);
  
  // Player update actions
  const { handlePlayerUpdate, handleBulkPlayerUpdate } = usePlayerUpdate(
    players,
    setPlayers,
    setSelectedPlayer
  );
  
  // Player add actions
  const { handleAddPlayer } = usePlayerAdd(
    players,
    setPlayers,
    setIsAddPlayerOpen
  );
  
  // Player delete actions
  const { handleDeletePlayer } = usePlayerDelete(
    players,
    setPlayers,
    setSelectedPlayer
  );

  return {
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer,
    handleDeletePlayer
  };
}

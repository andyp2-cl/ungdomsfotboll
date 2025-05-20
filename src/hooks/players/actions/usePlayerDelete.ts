
import { Player } from "@/types/player";
import { savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function usePlayerDelete(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Player | null>>
) {
  const { toast } = useToast();

  const handleDeletePlayer = async (playerId: string) => {
    try {
      // Find the player name before deleting it
      const playerToDelete = players.find(player => player.id === playerId);
      if (!playerToDelete) {
        throw new Error("Spelaren hittades inte");
      }

      const playerName = playerToDelete.name;
      const updatedPlayers = players.filter(player => player.id !== playerId);
      
      // First update local state
      setPlayers(updatedPlayers);
      
      // Clear selected player if it was the deleted one
      setSelectedPlayer(prevSelected => 
        prevSelected && prevSelected.id === playerId ? null : prevSelected
      );
      
      // Then save to database
      await savePlayers(updatedPlayers);
      
      toast({
        title: "Spelaren borttagen",
        description: `${playerName} har tagits bort.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "Kunde inte ta bort spelaren",
        description: "Ett fel uppstod när spelaren skulle tas bort.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { handleDeletePlayer };
}

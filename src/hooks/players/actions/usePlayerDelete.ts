
import { Player } from "@/types/player";
import { savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

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
      
      // Delete directly from Supabase database
      const { error: playerDeleteError } = await supabase
        .from('players')
        .delete()
        .eq('id', playerId);
        
      if (playerDeleteError) {
        throw new Error(`Error deleting player from database: ${playerDeleteError.message}`);
      }
      
      // Delete player-activity relationships
      const { error: relationsDeleteError } = await supabase
        .from('player_activities')
        .delete()
        .eq('player_id', playerId);
        
      if (relationsDeleteError) {
        console.error("Error removing player-activity relationships:", relationsDeleteError);
        // Continue with deletion even if relationship deletion has errors
      }
      
      // Also update local storage through the existing savePlayers function
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

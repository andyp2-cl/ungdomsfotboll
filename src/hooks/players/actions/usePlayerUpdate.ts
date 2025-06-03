
import { Player } from "@/types/player";
import { savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { useDevelopmentHistory } from "@/hooks/useDevelopmentHistory";

export function usePlayerUpdate(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Player | null>>
) {
  const { toast } = useToast();
  const { addHistoryEntry } = useDevelopmentHistory();

  const handlePlayerUpdate = async (updatedPlayer: Player) => {
    try {
      console.log("Updating player:", updatedPlayer.name);
      console.log("With development data:", updatedPlayer.development);
      console.log("With image data:", updatedPlayer.image ? "Present (length: " + updatedPlayer.image.length + ")" : "Not present");
      
      // Find the existing player to compare development changes
      const existingPlayer = players.find(p => p.id === updatedPlayer.id);
      
      // Important: Make a deep copy of the player to ensure image data is properly preserved
      const playerForUpdate = {
        ...updatedPlayer,
        development: updatedPlayer.development ? { ...updatedPlayer.development } : null,
        // Ensure image is properly preserved
        image: updatedPlayer.image
      };
      
      const updatedPlayers = players.map(player => 
        player.id === playerForUpdate.id ? playerForUpdate : player
      );
      
      // First update local state
      setPlayers(updatedPlayers);
      
      // Then save to database with better error handling
      try {
        await savePlayers(updatedPlayers);
        console.log("Players saved successfully after update");
        
        // Try to save development history with improved logic (only significant changes)
        if (updatedPlayer.development && existingPlayer?.development) {
          try {
            await addHistoryEntry(
              updatedPlayer.id, 
              updatedPlayer.development,
              "Automatisk sparning vid spelaruppdatering"
            );
            console.log("Development history checked for significant changes");
          } catch (historyError) {
            console.error("Failed to save development history:", historyError);
            // Don't fail the whole update if history saving fails
          }
        }
      } catch (saveError) {
        console.error("Failed to save updated players to database:", saveError);
        toast({
          title: "Databas-synkroniseringsfel",
          description: "Ändringar gjordes lokalt men kunde inte sparas i databasen. Försök igen senare.",
          variant: "destructive"
        });
      }
      
      // Update selected player if needed
      setSelectedPlayer(prevSelected => 
        prevSelected && prevSelected.id === playerForUpdate.id ? playerForUpdate : prevSelected
      );
      
      toast({
        title: "Spelaren uppdaterad",
        description: `${playerForUpdate.name} har uppdaterats.`,
      });
      
      return true; // Return success status
    } catch (error) {
      console.error("Error updating player:", error);
      toast({
        title: "Kunde inte uppdatera spelaren",
        description: "Ett fel uppstod när spelaren skulle uppdateras.",
        variant: "destructive"
      });
      return false; // Return failure status
    }
  };

  const handleBulkPlayerUpdate = async (updatedPlayers: Player[]) => {
    try {
      // Create a map of the current players by ID
      const playerMap = new Map(players.map(player => [player.id, player]));
      
      // Update the map with the new player data
      updatedPlayers.forEach(player => {
        if (playerMap.has(player.id)) {
          playerMap.set(player.id, player);
        }
      });
      
      // Convert the map back to an array
      const newPlayers = Array.from(playerMap.values());
      
      // Update the state and save to storage
      setPlayers(newPlayers);
      await savePlayers(newPlayers);
      
      // Update selected player if it was one of the updated ones
      setSelectedPlayer(prevSelected => {
        if (!prevSelected) return null;
        const updatedSelectedPlayer = updatedPlayers.find(p => p.id === prevSelected.id);
        return updatedSelectedPlayer || prevSelected;
      });
      
      return true;
    } catch (error) {
      console.error("Error bulk updating players:", error);
      toast({
        title: "Kunde inte uppdatera spelare",
        description: "Ett fel uppstod när spelarna skulle uppdateras.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handlePlayerUpdate,
    handleBulkPlayerUpdate
  };
}

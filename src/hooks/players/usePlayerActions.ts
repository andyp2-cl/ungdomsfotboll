
import { useEffect } from "react";
import { Player } from "@/types/player";
import { getStoredPlayers, savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { triggerBackupIfNeeded } from "@/utils/storage/backup/autoBackup";

export function usePlayerActions(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setSelectedPlayer: React.Dispatch<React.SetStateAction<Player | null>>,
  setIsAddPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        const storedPlayers = await getStoredPlayers();
        
        // Log players loaded for debugging
        console.log("Players loaded from storage:", storedPlayers.length);
        
        // Check if specific players exist - for debugging
        const alvin = storedPlayers.find(p => p.name.includes("Alvin"));
        if (alvin) {
          console.log("Alvin found in loaded players:", alvin);
        } else {
          console.warn("Alvin not found in loaded players!");
        }

        // Check for Herman Lavin specifically
        const herman = storedPlayers.find(p => p.name.includes("Herman Lavin"));
        if (herman) {
          console.log("Herman Lavin found in loaded players:", herman);
          if (herman.image) {
            console.log("Herman Lavin has an image:", typeof herman.image, herman.image.substring(0, 50) + "...");
          } else {
            console.warn("Herman Lavin has no image!");
          }
        }
        
        setPlayers(storedPlayers);

        // If we have players data, create an automatic backup
        if (storedPlayers.length > 0) {
          triggerBackupIfNeeded();
        }
      } catch (error) {
        console.error("Error loading players:", error);
        toast({
          title: "Kunde inte ladda spelare",
          description: "Ett fel uppstod när spelare skulle hämtas från databasen.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadPlayers();
  }, [toast, setPlayers, setIsLoading]);

  const handlePlayerUpdate = async (updatedPlayer: Player) => {
    try {
      console.log("Updating player:", updatedPlayer.name);
      
      // Validate image if present
      if (updatedPlayer.image) {
        console.log("Player has an image, validating...");
        if (typeof updatedPlayer.image !== 'string' || updatedPlayer.image.length < 10) {
          console.warn("Invalid image format detected, clearing image");
          updatedPlayer.image = undefined;
        } else {
          console.log("Image passed validation, length:", updatedPlayer.image.length);
        }
      }
      
      const updatedPlayers = players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      );
      
      // First update local state
      setPlayers(updatedPlayers);
      
      // Then save to database with better error handling
      try {
        await savePlayers(updatedPlayers);
        console.log("Players saved successfully after update");
        
        // Trigger backup after successful save
        triggerBackupIfNeeded();
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
        prevSelected && prevSelected.id === updatedPlayer.id ? updatedPlayer : prevSelected
      );
      
      toast({
        title: "Spelaren uppdaterad",
        description: `${updatedPlayer.name} har uppdaterats.`,
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

  const handleAddPlayer = async (newPlayer: Player) => {
    try {
      const updatedPlayers = [...players, newPlayer];
      setPlayers(updatedPlayers);
      await savePlayers(updatedPlayers);
      setIsAddPlayerOpen(false);
      toast({
        title: "Spelare tillagd",
        description: `${newPlayer.name} har lagts till.`,
      });
      return true;
    } catch (error) {
      console.error("Error adding player:", error);
      toast({
        title: "Kunde inte lägga till spelaren",
        description: "Ett fel uppstod när spelaren skulle läggas till.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    handlePlayerUpdate,
    handleBulkPlayerUpdate,
    handleAddPlayer
  };
}

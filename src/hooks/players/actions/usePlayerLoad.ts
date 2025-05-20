
import { useEffect } from "react";
import { Player } from "@/types/player";
import { getStoredPlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function usePlayerLoad(
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        setIsLoading(true);
        const storedPlayers = await getStoredPlayers();
        console.log("Players loaded from storage with development data:", 
          storedPlayers.slice(0, 3).map(p => ({
            name: p.name,
            development: p.development,
            image: p.image ? "Has image" : "No image" 
          }))
        );
        
        setPlayers(storedPlayers);
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

  // No return value needed as this is an effect hook
  return {};
}

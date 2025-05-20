
import { Player } from "@/types/player";
import { savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function usePlayerAdd(
  players: Player[],
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>,
  setIsAddPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>
) {
  const { toast } = useToast();

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

  return { handleAddPlayer };
}

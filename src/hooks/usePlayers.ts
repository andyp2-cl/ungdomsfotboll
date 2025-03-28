
import { useState, useEffect, useMemo } from "react";
import { Player, PlayerGrade } from "@/types/player";
import { getStoredPlayers, savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<PlayerGrade[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { toast } = useToast();

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const storedPlayers = await getStoredPlayers();
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
  }, [toast]);

  const handleGradeChange = (grade: PlayerGrade) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  const handlePlayerUpdate = async (updatedPlayer: Player) => {
    const updatedPlayers = players.map(player => 
      player.id === updatedPlayer.id ? updatedPlayer : player
    );
    
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    
    if (selectedPlayer && selectedPlayer.id === updatedPlayer.id) {
      setSelectedPlayer(updatedPlayer);
    }
    
    toast({
      title: "Spelaren uppdaterad",
      description: `${updatedPlayer.name} har uppdaterats.`,
    });
  };

  const handleAddPlayer = async (newPlayer: Player) => {
    const updatedPlayers = [...players, newPlayer];
    setPlayers(updatedPlayers);
    await savePlayers(updatedPlayers);
    setIsAddPlayerOpen(false);
    toast({
      title: "Spelare tillagd",
      description: `${newPlayer.name} har lagts till.`,
    });
  };

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      return matchesSearch && matchesGrade;
    });
  }, [searchQuery, selectedGrades, players]);

  return {
    players,
    setPlayers,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    selectedPlayer,
    setSelectedPlayer,
    editingPlayer,
    setEditingPlayer,
    isAddPlayerOpen,
    setIsAddPlayerOpen,
    viewMode,
    setViewMode,
    filteredPlayers,
    handleGradeChange,
    handlePlayerUpdate,
    handleAddPlayer
  };
}

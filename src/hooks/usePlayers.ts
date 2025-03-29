import { useState, useEffect, useMemo } from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";
import { getStoredPlayers, savePlayers } from "@/utils/storage";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrades, setSelectedGrades] = useState<PlayerGrade[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<PlayerPosition[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Default to list view
  const { toast } = useToast();

  // Update view mode if device type changes
  useEffect(() => {
    setViewMode("list"); // Always use list view regardless of device
  }, [isMobile]);

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

  const handlePositionChange = (position: PlayerPosition) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position) 
        : [...prev, position]
    );
  };

  const handlePlayerUpdate = async (updatedPlayer: Player) => {
    try {
      console.log("Updating player:", updatedPlayer.name);
      
      const updatedPlayers = players.map(player => 
        player.id === updatedPlayer.id ? updatedPlayer : player
      );
      
      // First update local state
      setPlayers(updatedPlayers);
      
      // Then save to database with better error handling
      try {
        await savePlayers(updatedPlayers);
        console.log("Players saved successfully after update");
      } catch (saveError) {
        console.error("Failed to save updated players to database:", saveError);
        toast({
          title: "Databas-synkroniseringsfel",
          description: "Ändringar gjordes lokalt men kunde inte sparas i databasen. Försök igen senare.",
          variant: "destructive"
        });
      }
      
      // Update selected player if needed
      if (selectedPlayer && selectedPlayer.id === updatedPlayer.id) {
        setSelectedPlayer(updatedPlayer);
      }
      
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
      if (selectedPlayer) {
        const updatedSelectedPlayer = updatedPlayers.find(p => p.id === selectedPlayer.id);
        if (updatedSelectedPlayer) {
          setSelectedPlayer(updatedSelectedPlayer);
        }
      }
      
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

  const filteredPlayers = useMemo(() => {
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      const matchesPosition = selectedPositions.length === 0 || 
        (player.positions && player.positions.some(position => selectedPositions.includes(position)));
      
      return matchesSearch && matchesGrade && matchesPosition;
    });
  }, [searchQuery, selectedGrades, selectedPositions, players]);

  return {
    players,
    setPlayers,
    isLoading,
    searchQuery,
    setSearchQuery,
    selectedGrades,
    selectedPositions,
    setSelectedPositions,
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
    handlePositionChange,
    handlePlayerUpdate,
    handleBulkPlayerUpdate: handleBulkPlayerUpdate || ((updatedPlayers: Player[]) => false),
    handleAddPlayer: handleAddPlayer || ((newPlayer: Player) => false)
  };
}

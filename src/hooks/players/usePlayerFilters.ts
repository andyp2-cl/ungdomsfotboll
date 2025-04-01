
import { useMemo } from "react";
import { Player, PlayerGrade, PlayerPosition } from "@/types/player";

interface UsePlayerFiltersProps {
  players: Player[];
  searchQuery: string;
  selectedGrades: PlayerGrade[];
  selectedPositions: PlayerPosition[];
}

export function usePlayerFilters({
  players,
  searchQuery,
  selectedGrades,
  selectedPositions
}: UsePlayerFiltersProps) {
  const handleGradeChange = (grade: PlayerGrade, setSelectedGrades: React.Dispatch<React.SetStateAction<PlayerGrade[]>>) => {
    setSelectedGrades(prev => 
      prev.includes(grade) 
        ? prev.filter(g => g !== grade) 
        : [...prev, grade]
    );
  };

  const handlePositionChange = (position: PlayerPosition, setSelectedPositions: React.Dispatch<React.SetStateAction<PlayerPosition[]>>) => {
    setSelectedPositions(prev => 
      prev.includes(position) 
        ? prev.filter(p => p !== position) 
        : [...prev, position]
    );
  };

  const filteredPlayers = useMemo(() => {
    // Log the number of players before filtering for debugging
    console.log("Total players before filtering:", players.length);
    
    return players.filter(player => {
      // Make sure player.name exists before attempting toLowerCase()
      const playerName = player.name || "";
      
      // Filter by search query
      const matchesSearch = searchQuery 
        ? playerName.toLowerCase().includes(searchQuery.toLowerCase()) 
        : true;
      
      // Filter by grade - if no grades selected, show all
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      
      // Filter by position - if no positions selected, show all
      // Only filter by position if player has positions property and it's an array
      const matchesPosition = selectedPositions.length === 0 || 
        (player.positions && Array.isArray(player.positions) && 
         player.positions.some(position => selectedPositions.includes(position)));
      
      // For debugging
      if (playerName.includes("Alvin")) {
        console.log("Alvin filter check:", {
          player,
          matchesSearch,
          matchesGrade,
          matchesPosition,
          searchQuery,
          selectedGrades,
          selectedPositions
        });
      }
      
      return matchesSearch && matchesGrade && matchesPosition;
    });
  }, [searchQuery, selectedGrades, selectedPositions, players]);

  // Log filtered players count for debugging
  console.log("Filtered players count:", filteredPlayers.length);

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

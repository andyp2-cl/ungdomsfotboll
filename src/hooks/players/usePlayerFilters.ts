
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
    
    // Normalize the search query (remove case sensitivity and trim)
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    return players.filter(player => {
      // Make sure player.name exists and normalize it
      const playerName = player.name ? player.name.toLowerCase() : "";
      
      // Check if player name includes the search query (more permissive search)
      // Only apply if searchQuery has content
      const matchesSearch = !normalizedQuery || playerName.includes(normalizedQuery);
      
      // Filter by grade - if no grades selected, show all
      const matchesGrade = selectedGrades.length === 0 || 
        selectedGrades.includes(player.grade);
      
      // Filter by position - if no positions selected, show all
      // More defensive position handling - don't filter if positions is null/undefined
      let matchesPosition = true;
      if (selectedPositions.length > 0 && player.positions) {
        // Ensure positions is an array
        const positionsArray = Array.isArray(player.positions) ? player.positions : [player.positions];
        matchesPosition = positionsArray.some(position => 
          selectedPositions.includes(position as PlayerPosition)
        );
      }
      
      const shouldInclude = matchesSearch && matchesGrade && matchesPosition;
      return shouldInclude;
    });
  }, [searchQuery, selectedGrades, selectedPositions, players]);

  // Log filtered players count
  console.log("Filtered players count:", filteredPlayers.length);
  if (filteredPlayers.length < players.length) {
    console.log("Some players were filtered out. First 5 filtered players:", 
      filteredPlayers.slice(0, 5).map(p => p.name));
  }

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

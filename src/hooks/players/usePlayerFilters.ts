
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
    
    // Check if Alvin exists in the original players array
    const hasAlvin = players.some(p => p.name?.toLowerCase().includes("alvin"));
    console.log("Alvin exists in players array:", hasAlvin);
    
    // Normalize the search query (remove case sensitivity and trim)
    const normalizedQuery = searchQuery.toLowerCase().trim();
    
    // Log the normalized search query for debugging
    if (normalizedQuery) {
      console.log("Normalized search query:", normalizedQuery);
    }
    
    return players.filter(player => {
      // Make sure player.name exists and normalize it
      const playerName = player.name ? player.name.toLowerCase() : "";
      
      // Debug specific players
      if (playerName.includes("alvin")) {
        console.log("Found Alvin:", player.name);
        console.log("Search match?", !normalizedQuery || playerName.includes(normalizedQuery));
        console.log("Grade match?", selectedGrades.length === 0 || selectedGrades.includes(player.grade));
      }
      
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
  
  // Check for specific players in the filtered results
  const hasAlvinInFiltered = filteredPlayers.some(p => p.name?.toLowerCase().includes("alvin"));
  console.log("Alvin found in filtered results:", hasAlvinInFiltered);
  
  if (filteredPlayers.length < players.length) {
    console.log("Some players were filtered out. First 5 filtered players:", 
      filteredPlayers.slice(0, 5).map(p => p.name).join(", "));
  }

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

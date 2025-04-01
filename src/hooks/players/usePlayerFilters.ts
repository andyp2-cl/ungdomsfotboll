
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
    
    // Log all players to check if Alvin exists in the initial dataset
    const alvin = players.find(p => p.name?.includes("Alvin"));
    if (alvin) {
      console.log("Alvin found in initial players list:", alvin);
    } else {
      console.warn("Alvin not found in initial players list!");
    }
    
    // Debug: log all player names to help find issues
    if (players.length > 0 && players.length < 50) {
      console.log("All player names:", players.map(p => p.name).join(", "));
    }
    
    return players.filter(player => {
      // Make sure player.name exists before attempting toLowerCase()
      const playerName = player.name || "";
      
      // Filter by search query - only apply if searchQuery has content
      const matchesSearch = !searchQuery || 
        playerName.toLowerCase().includes(searchQuery.toLowerCase());
      
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
      
      // Extra debugging for specific players
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
      
      const shouldInclude = matchesSearch && matchesGrade && matchesPosition;
      return shouldInclude;
    });
  }, [searchQuery, selectedGrades, selectedPositions, players]);

  // Log filtered players count and any specific players we're looking for
  console.log("Filtered players count:", filteredPlayers.length);
  const filteredAlvin = filteredPlayers.find(p => p.name?.includes("Alvin"));
  if (filteredAlvin) {
    console.log("Alvin found in filtered players:", filteredAlvin);
  } else if (players.find(p => p.name?.includes("Alvin"))) {
    console.warn("Alvin was filtered out!");
  }

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

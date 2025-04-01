
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
  const normalizeString = (str: string) => {
    if (!str) return '';
    // Convert to lowercase and remove diacritics (e.g. ä, ö, å)
    return str.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, ""); // Remove all non-alphanumeric characters
  };

  const filteredPlayers = useMemo(() => {
    // Log for debugging
    console.log("Filtering players, total count:", players.length);
    
    // First, normalize the search query for better matching
    const normalizedQuery = normalizeString(searchQuery);
    console.log("Normalized search query:", normalizedQuery);
    
    // Early return if no filters are applied
    if (!searchQuery && selectedGrades.length === 0 && selectedPositions.length === 0) {
      console.log("No filters applied, returning all players");
      return players;
    }
    
    const results = players.filter(player => {
      // Check if player name includes search query (case insensitive)
      const nameMatches = !searchQuery || 
        normalizeString(player.name).includes(normalizedQuery);
      
      // Check if player grade is selected, or no grades are selected
      const gradeMatches = selectedGrades.length === 0 || 
        selectedGrades.includes(player.grade);
      
      // Check if player has at least one of the selected positions, or no positions are selected
      const positionMatches = selectedPositions.length === 0 || 
        (player.positions && player.positions.some(pos => selectedPositions.includes(pos)));
      
      // Debug log for specific players
      if (player.name.toLowerCase().includes("alvin")) {
        console.log(`Filtering ${player.name}:`, {
          nameMatches,
          normalizedName: normalizeString(player.name),
          gradeMatches,
          positionMatches,
          included: nameMatches && gradeMatches && positionMatches
        });
      }
      
      return nameMatches && gradeMatches && positionMatches;
    });
    
    // Log results
    console.log(`Filtered ${players.length} players to ${results.length}`);
    
    return results;
  }, [players, searchQuery, selectedGrades, selectedPositions]);

  const handleGradeChange = (grade: PlayerGrade) => {
    return selectedGrades.includes(grade);
  };

  const handlePositionChange = (position: PlayerPosition) => {
    return selectedPositions.includes(position);
  };

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

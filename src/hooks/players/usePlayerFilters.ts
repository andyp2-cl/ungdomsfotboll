
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
      .replace(/[^a-z0-9\s]/g, ""); // Allow spaces in the normalized string
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
    
    // Log all player names to help with debugging
    if (players.length > 0) {
      console.log("All player names:", players.map(p => p.name).join(", "));
    }
    
    // Check specifically for Alvin in the dataset
    const hasAlvin = players.some(p => p.name && p.name.toLowerCase().includes("alvin"));
    console.log("Dataset contains player named Alvin:", hasAlvin);
    
    const results = players.filter(player => {
      if (!player.name) {
        return false; // Skip players without names
      }
      
      // Check if player name includes search query (case insensitive)
      const normalizedName = normalizeString(player.name);
      const nameMatches = !searchQuery || normalizedName.includes(normalizedQuery);
      
      // Determine if this player is a coach
      const isCoach = player.positions?.includes('TRÄNARE');
      
      // Check if player grade is selected, or no grades are selected
      // Coaches are excluded from grade filtering (they will show up regardless of grade selections)
      const gradeMatches = isCoach || selectedGrades.length === 0 || 
        (player.grade && selectedGrades.includes(player.grade));
      
      // Check if player has at least one of the selected positions, or no positions are selected
      const positionMatches = selectedPositions.length === 0 || 
        (player.positions && player.positions.some(pos => selectedPositions.includes(pos)));
      
      // Debug log for all players to better trace the filtering
      console.log(`Filtering ${player.name}:`, {
        normalizedName,
        nameMatches,
        isCoach,
        gradeMatches,
        positionMatches,
        included: nameMatches && gradeMatches && positionMatches
      });
      
      return nameMatches && gradeMatches && positionMatches;
    });
    
    // Log results
    console.log(`Filtered ${players.length} players to ${results.length}`);
    if (results.length > 0 && results.length < 10) {
      console.log("Filtered player names:", results.map(p => p.name).join(", "));
    }
    
    // Check if Alvin is in the results
    const hasAlvinInResults = results.some(p => p.name && p.name.toLowerCase().includes("alvin"));
    console.log("Filtered results contain Alvin:", hasAlvinInResults);
    
    return results;
  }, [players, searchQuery, selectedGrades, selectedPositions]);

  // These functions now return a boolean indicating if the item is currently selected
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

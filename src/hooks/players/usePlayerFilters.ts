
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
    return players.filter(player => {
      const matchesSearch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(player.grade);
      const matchesPosition = selectedPositions.length === 0 || 
        (player.positions && player.positions.some(position => selectedPositions.includes(position)));
      
      return matchesSearch && matchesGrade && matchesPosition;
    });
  }, [searchQuery, selectedGrades, selectedPositions, players]);

  return {
    filteredPlayers,
    handleGradeChange,
    handlePositionChange
  };
}

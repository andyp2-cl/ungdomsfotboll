
import { Player } from "@/types/player";
import { formatPositions, formatPosition, getPositionsString, isTrainer } from "@/utils/positionUtils";

// Re-export the centralized utilities for backward compatibility
export { formatPositions, formatPosition, getPositionsString, isTrainer };

export function usePlayerFormatting() {
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'bg-green-500 hover:bg-green-600';
      case 'B':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'C':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'D':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getGradeText = (grade: string | undefined) => {
    if (!grade) return '';
    return `Nivå ${grade}`;
  };

  return {
    getGradeColor,
    getGradeText,
    formatPosition,
    formatPositions
  };
}

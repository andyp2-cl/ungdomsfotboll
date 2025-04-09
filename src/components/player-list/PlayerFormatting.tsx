
import { Player } from "@/types/player";

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

  const formatPosition = (position: string) => {
    if (position === 'TRÄNARE') return 'Tränare';
    
    let formattedPosition = position
      .replace('MV', 'Målvakt')
      .replace('BACK', 'Back')
      .replace('MF', 'Mittfält')
      .replace('ANF', 'Anfall');
    
    return formattedPosition;
  };

  const formatPositions = (positions: string[] | undefined) => {
    if (!positions || positions.length === 0) return 'Odefinierad';
    
    const isTrainer = positions.includes('TRÄNARE');
    if (isTrainer) {
      return 'Tränare';
    }
    
    return positions.map(formatPosition).join(', ');
  };

  return {
    getGradeColor,
    getGradeText,
    formatPosition,
    formatPositions
  };
}

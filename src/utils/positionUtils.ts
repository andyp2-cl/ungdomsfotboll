
import { PlayerPosition } from "@/types/player";

// Define consistent position order for sorting
const POSITION_ORDER = {
  'TRÄNARE': 0,
  'MV': 1,
  'BACK': 2,
  'MF': 3,
  'ANF': 4
};

// Format individual position with full names
export function formatPosition(position: string): string {
  switch (position) {
    case 'TRÄNARE':
      return 'Tränare';
    case 'MV':
      return 'Målvakt';
    case 'BACK':
      return 'Försvarare';
    case 'MF':
      return 'Mittfältare';
    case 'ANF':
      return 'Anfallare';
    default:
      return position;
  }
}

// Format individual position with international abbreviations for mobile/compact views
export function formatPositionShort(position: string): string {
  switch (position) {
    case 'TRÄNARE':
      return 'Tränare';
    case 'MV':
      return 'GK';
    case 'BACK':
      return 'DEF';
    case 'MF':
      return 'MID';
    case 'ANF':
      return 'FW';
    default:
      return position;
  }
}

// Sort positions in consistent order
export function sortPositions(positions: string[]): string[] {
  return [...positions].sort((a, b) => {
    const orderA = POSITION_ORDER[a as keyof typeof POSITION_ORDER] ?? 999;
    const orderB = POSITION_ORDER[b as keyof typeof POSITION_ORDER] ?? 999;
    return orderA - orderB;
  });
}

// Format multiple positions with consistent handling and sorting
export function formatPositions(positions: string[] | undefined, compact: boolean = false): string {
  if (!positions || positions.length === 0) {
    return 'Ingen position';
  }
  
  const isTrainer = positions.includes('TRÄNARE');
  if (isTrainer) {
    return 'Tränare';
  }
  
  // Sort positions consistently before formatting
  const sortedPositions = sortPositions(positions);
  const formatter = compact ? formatPositionShort : formatPosition;
  return sortedPositions.map(formatter).join(', ');
}

// Get positions string for display (legacy compatibility)
export function getPositionsString(positions: string[] | undefined): string {
  return formatPositions(positions);
}

// Check if player is a trainer
export function isTrainer(positions: string[] | undefined): boolean {
  return positions?.includes('TRÄNARE') || false;
}

// Get primary position for sorting/display
export function getPrimaryPosition(positions: string[] | undefined): string {
  if (!positions || positions.length === 0) return 'Ingen position';
  if (positions.includes('TRÄNARE')) return 'Tränare';
  
  // Sort and return first position
  const sortedPositions = sortPositions(positions);
  return formatPosition(sortedPositions[0]);
}

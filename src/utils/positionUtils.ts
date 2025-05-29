
import { PlayerPosition } from "@/types/player";

// Format individual position with full names
export function formatPosition(position: string): string {
  switch (position) {
    case 'TRÄNARE':
      return 'Tränare';
    case 'MV':
      return 'Målvakt';
    case 'BACK':
      return 'Back';
    case 'MF':
      return 'Mittfältare';
    case 'ANF':
      return 'Anfallare';
    default:
      return position;
  }
}

// Format individual position with short names for mobile/compact views
export function formatPositionShort(position: string): string {
  switch (position) {
    case 'TRÄNARE':
      return 'Tränare';
    case 'MV':
      return 'MV';
    case 'BACK':
      return 'Back';
    case 'MF':
      return 'MF';
    case 'ANF':
      return 'ANF';
    default:
      return position;
  }
}

// Format multiple positions with consistent handling
export function formatPositions(positions: string[] | undefined, compact: boolean = false): string {
  if (!positions || positions.length === 0) {
    return 'Ingen position';
  }
  
  const isTrainer = positions.includes('TRÄNARE');
  if (isTrainer) {
    return 'Tränare';
  }
  
  const formatter = compact ? formatPositionShort : formatPosition;
  return positions.map(formatter).join(', ');
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
  return formatPosition(positions[0]);
}

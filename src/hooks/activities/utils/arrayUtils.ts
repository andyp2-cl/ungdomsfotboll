
/**
 * Utility functions for array operations in activity hooks
 */
import { Player } from "@/types/player";

/**
 * Checks if two player arrays are equal by comparing IDs and activities
 */
export const arePlayersEqual = (playersA: Player[], playersB: Player[]): boolean => {
  if (playersA.length !== playersB.length) return false;
  
  for (let i = 0; i < playersA.length; i++) {
    const playerA = playersA[i];
    const playerB = playersB[i];
    
    if (playerA.id !== playerB.id) return false;
    
    if (!arraysEqual(playerA.activities || [], playerB.activities || [])) {
      return false;
    }
  }
  
  return true;
};

/**
 * Checks if two arrays have the same values (regardless of order)
 */
export const arraysEqual = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) return false;
  
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  
  for (let i = 0; i < sortedA.length; i++) {
    if (sortedA[i] !== sortedB[i]) return false;
  }
  
  return true;
};

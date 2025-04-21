
import { addCupMatches, updateCupMatches } from './cup-matches';

// Re-export the functions from the new location
// This file is kept for backwards compatibility but should be considered deprecated
export { addCupMatches, updateCupMatches };

/**
 * @deprecated Use functions from cup-matches directory instead
 */
console.warn('Warning: Direct imports from cupMatches.ts are deprecated. Import from cup-matches directory instead.');

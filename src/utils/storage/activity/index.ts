
// Re-export all activity storage functionality
export * from './types';
export * from './fetch';
export * from './save';
export * from './participants';
export * from './cup-matches';
export * from './delete';

// Re-export the deprecated file for backwards compatibility
// But explicitly handle the addCupMatches to avoid ambiguity
import { addCupMatches as deprecatedAddCupMatches } from './cupMatches';
export { deprecatedAddCupMatches as addCupMatchesLegacy };

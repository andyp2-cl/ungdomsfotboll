
import { addCupMatches as addMatches, updateCupMatches } from './cup-matches';

// Re-export-funktionerna från den nya platsen med nya namn för att undvika konflikter
// Denna fil behålls för bakåtkompatibilitet men bör anses som inaktuell
export { addMatches as addCupMatchesToActivity, updateCupMatches };

/**
 * @deprecated Använd funktioner från cup-matches katalogen istället
 */
console.warn('Varning: Direktimporter från cupMatches.ts är inaktuella. Importera från cup-matches katalogen istället.');

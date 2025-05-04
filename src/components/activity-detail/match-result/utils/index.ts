
// Re-export all utility functions from their respective files
export * from './team-detection';
export * from './outcome-calculation';
export * from './result-display';

// Make sure isHomeMatch is exported
export { isHomeMatch } from './team-detection';
export { calculateWinStatus, determineMatchOutcome } from './outcome-calculation';
export { getOutcomeText, getOutcomeColorClass, getResultColorClass } from './result-display';

// For direct reference when 'determineOutcome' is used
export { determineMatchOutcome as determineOutcome } from './outcome-calculation';


// Re-export all activity storage functionality
export * from './types';
export * from './fetch';
export * from './save';
export * from './participants';
export * from './cup-matches';
export * from './delete';

// Re-export the deprecated file for backwards compatibility
// This should be removed in future versions
// Fixed export to avoid naming conflict
export { addCupMatchesToActivity } from './cupMatches';

// Export core activity storage functions for compatibility
export * from '../activityStorage';

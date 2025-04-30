
import { SyncState } from './syncState';

/**
 * Fetch the current sync state from server/storage
 */
export async function fetchSyncState(): Promise<SyncState> {
  // This would typically be an API call or local storage read
  // For now, we'll return mock data
  return {
    lastSynced: localStorage.getItem('lastSynced') || null,
    syncing: false,
    error: null,
    pendingChanges: Number(localStorage.getItem('pendingChanges') || '0')
  };
}

/**
 * Update the sync state after a successful sync
 */
export async function updateSyncState(): Promise<void> {
  // This would typically be an API call or local storage write
  const now = new Date().toISOString();
  localStorage.setItem('lastSynced', now);
  localStorage.setItem('pendingChanges', '0');
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
}

/**
 * Register a change that needs to be synced
 */
export async function registerChange(): Promise<void> {
  const pendingChanges = Number(localStorage.getItem('pendingChanges') || '0');
  localStorage.setItem('pendingChanges', (pendingChanges + 1).toString());
}

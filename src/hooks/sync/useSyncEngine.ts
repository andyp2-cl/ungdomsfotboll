
import { useState, useEffect, useCallback } from 'react';
import { fetchSyncState, updateSyncState } from './syncOperations';
import { SyncState } from './syncState';

interface UseSyncEngineOptions {
  autoSync?: boolean;
  syncInterval?: number;
  onSyncComplete?: (state: SyncState) => void;
  onSyncError?: (error: Error) => void;
}

/**
 * Custom hook for synchronizing data between client and server
 */
export function useSyncEngine(options: UseSyncEngineOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 300000, // 5 minutes
    onSyncComplete,
    onSyncError
  } = options;

  const [syncState, setSyncState] = useState<SyncState>({
    lastSynced: null,
    syncing: false,
    error: null,
    pendingChanges: 0
  });

  // Function to initiate sync
  const sync = useCallback(async () => {
    if (syncState.syncing) return;

    setSyncState(prev => ({ ...prev, syncing: true, error: null }));

    try {
      // First fetch the current sync state
      const currentState = await fetchSyncState();

      // Update our local state
      setSyncState(prev => ({ 
        ...prev, 
        lastSynced: currentState.lastSynced,
        pendingChanges: currentState.pendingChanges 
      }));

      // If there are pending changes, sync them
      if (currentState.pendingChanges > 0) {
        await updateSyncState();
        
        // Update our local state again after sync
        setSyncState(prev => ({
          ...prev,
          syncing: false,
          lastSynced: new Date().toISOString(),
          pendingChanges: 0
        }));
        
        // Notify if callback provided
        if (onSyncComplete) {
          onSyncComplete({
            lastSynced: new Date().toISOString(),
            syncing: false,
            error: null,
            pendingChanges: 0
          });
        }
      } else {
        // No changes to sync
        setSyncState(prev => ({ ...prev, syncing: false }));
      }
    } catch (error) {
      console.error('Error during sync operation:', error);
      setSyncState(prev => ({ 
        ...prev, 
        syncing: false, 
        error: error instanceof Error ? error : new Error('Unknown sync error') 
      }));

      // Notify if callback provided
      if (onSyncError && error instanceof Error) {
        onSyncError(error);
      }
    }
  }, [syncState.syncing, onSyncComplete, onSyncError]);

  // Auto-sync effect
  useEffect(() => {
    if (!autoSync) return;

    // Initial sync
    sync();

    // Setup interval for periodic sync
    const intervalId = setInterval(sync, syncInterval);

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [autoSync, sync, syncInterval]);

  return {
    syncState,
    sync,
    resetError: () => setSyncState(prev => ({ ...prev, error: null }))
  };
}

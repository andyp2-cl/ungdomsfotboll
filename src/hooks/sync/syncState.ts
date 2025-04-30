
/**
 * Interface representing the current state of synchronization
 */
export interface SyncState {
  /**
   * ISO timestamp of when the last sync occurred, or null if never synced
   */
  lastSynced: string | null;
  
  /**
   * Whether a sync operation is currently in progress
   */
  syncing: boolean;
  
  /**
   * Any error that occurred during the last sync attempt, or null if no error
   */
  error: Error | null;
  
  /**
   * Number of changes waiting to be synced
   */
  pendingChanges: number;
}

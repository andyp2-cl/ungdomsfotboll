
import { createBackup } from './createBackup';
import { restoreBackup } from './restoreBackup';
import { getLastBackupInfo } from './utils';
import { BackupInfo } from './types';

/**
 * Hook for backup and restore functionality
 */
export const useBackupRestore = () => {
  return { 
    createBackup, 
    restoreBackup, 
    getLastBackupInfo 
  };
};

// Re-export types and functions for external use
export type { BackupData, BackupInfo } from './types';

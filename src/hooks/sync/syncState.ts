
import { useState, useEffect, useCallback } from "react";
import { toast as sonnerToast } from "sonner";

/**
 * Module for tracking sync state and UI interactions
 */

/**
 * Check if there are pending updates that need to be synced
 */
export const checkPendingUpdates = (): number => {
  try {
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      return 0;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    return Object.keys(pendingUpdates).length;
  } catch (error) {
    console.error("Error checking pending updates:", error);
    return 0;
  }
};

/**
 * Handle displaying notifications based on sync results
 */
export const handleSyncNotifications = (
  successCount: number,
  failureCount: number
): void => {
  if (successCount > 0) {
    sonnerToast.success(`${successCount} matchresultat synkroniserade till databasen`);
  }
  
  if (failureCount > 0) {
    sonnerToast.warning(`Kunde inte synka ${failureCount} ändringar. Försöker igen senare.`);
  }
};

/**
 * Trigger a manual sync by reloading the page
 */
export const triggerManualSync = async (isOnline: boolean): Promise<void> => {
  // Check if there are pending updates
  const pendingUpdatesCount = checkPendingUpdates();
  
  if (pendingUpdatesCount === 0) {
    sonnerToast.info("Inga ändringar att synkronisera");
    return;
  }
  
  // In online mode, trigger sync by reload
  if (isOnline) {
    sonnerToast.loading(`Synkroniserar ${pendingUpdatesCount} matchresultat...`);
    
    // Force reload page to trigger sync engine
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  } else {
    // In offline mode, just show notification
    sonnerToast.info("Ändringar synkas automatiskt när du är online igen");
  }
};

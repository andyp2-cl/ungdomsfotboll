
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import { checkPendingUpdates } from "../utils/databaseUtils";

export function useOfflineManagement(isOnline: boolean) {
  const [pendingUpdatesCount, setPendingUpdatesCount] = useState(0);

  // Check for pending updates periodically
  useEffect(() => {
    const updatePendingCount = () => {
      // Fix: Ensure checkPendingUpdates returns a number, not a Promise<boolean>
      const count = checkPendingUpdates();
      setPendingUpdatesCount(count);
    };
    
    // Initial check
    updatePendingCount();
    
    // Periodic check
    const intervalId = setInterval(updatePendingCount, 30000);
    return () => clearInterval(intervalId);
  }, []);
  
  // Trigger manual sync from pending updates in localStorage
  const handleSyncPendingUpdates = () => {
    // Get pending updates count
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (!pendingUpdatesJson) {
      toast.info("Inga ändringar att synkronisera");
      return;
    }
    
    const pendingUpdates = JSON.parse(pendingUpdatesJson);
    const count = Object.keys(pendingUpdates).length;
    
    if (count > 0) {
      // In offline mode, we can still show this information
      toast.loading(`${count} ändringar sparade lokalt och väntar på synkronisering`);
      
      // Only force reload if we're online
      if (isOnline) {
        toast.loading(`Synkroniserar ${count} ändringar till databasen...`);
        // Force reload page to trigger sync
        window.location.reload();
      } else {
        toast.info("Ändringar synkas automatiskt när du är online igen");
      }
    } else {
      toast.info("Inga ändringar att synkronisera");
    }
  };

  return {
    pendingUpdatesCount,
    handleSyncPendingUpdates
  };
}

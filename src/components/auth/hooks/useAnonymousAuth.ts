
import { useOnlineStatus } from './useOnlineStatus';
import { useSessionState } from './useSessionState';
import { useConnectionManagement } from './useConnectionManagement';
import { useOfflineManagement } from './useOfflineManagement';
import { useEffect, useState, useCallback } from 'react';
import { shouldAutoConnectDatabase, setAutoConnectDatabase } from '@/utils/environment';

export function useAnonymousAuth() {
  // Get online status
  const { isOnline } = useOnlineStatus();
  
  // Get session state
  const { isAuthenticated } = useSessionState();
  
  // Auto-connect state - default to true
  const [autoConnectActive, setAutoConnectActive] = useState(true);
  
  // Get connection management
  const { 
    connectionChecked, 
    isConnecting, 
    connectionError, 
    isRLSEnabled, 
    checkDatabaseConnection,
    handleForceReconnect
  } = useConnectionManagement(isOnline);
  
  // Get offline management
  const { pendingUpdatesCount, handleSyncPendingUpdates } = useOfflineManagement(isOnline);

  // Toggle auto-connect setting (always enabled in this implementation)
  const toggleAutoConnect = useCallback((enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : true;
    setAutoConnectActive(newValue);
    setAutoConnectDatabase(newValue);
    
    if (newValue && isOnline) {
      // If enabling, try to connect immediately
      checkDatabaseConnection(true);
    }
  }, [isOnline, checkDatabaseConnection]);
  
  // Add automatic connection attempt on mount and when online status changes
  useEffect(() => {
    if (isOnline) {
      console.log("Auto-connecting to database...");
      checkDatabaseConnection(true);
    }
  }, [isOnline, checkDatabaseConnection]);
  
  return {
    isAuthenticated,
    isOnline,
    isRLSEnabled,
    pendingUpdatesCount,
    connectionChecked,
    isConnecting,
    connectionError,
    handleSyncPendingUpdates,
    checkDatabaseConnection,
    handleForceReconnect,
    autoConnectActive,
    toggleAutoConnect
  };
}

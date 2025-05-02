
import { useOnlineStatus } from './useOnlineStatus';
import { useSessionState } from './useSessionState';
import { useConnectionManagement } from './useConnectionManagement';
import { useAuthenticationActions } from './useAuthenticationActions';
import { useOfflineManagement } from './useOfflineManagement';
import { useEffect, useState, useCallback } from 'react';
import { shouldAutoConnectDatabase, setAutoConnectDatabase } from '@/utils/environment';

export function useAnonymousAuth() {
  // Get online status
  const { isOnline } = useOnlineStatus();
  
  // Get session state
  const { isAuthenticated } = useSessionState();
  
  // Auto-connect state
  const [autoConnectActive, setAutoConnectActive] = useState(shouldAutoConnectDatabase());
  
  // Get connection management
  const { 
    dbStatus, 
    isCheckingDb, 
    dbError, 
    handleForceReconnect,
    checkDbConnection
  } = useConnectionManagement();
  
  // Get authentication actions
  const { isAuthenticating, handleLogin } = useAuthenticationActions(isOnline);
  
  // Get offline management
  const { pendingUpdatesCount, handleSyncPendingUpdates } = useOfflineManagement(isOnline);

  // Map the properties to new names to maintain compatibility
  const connectionChecked = dbStatus !== 'unknown';
  const isConnecting = isCheckingDb;
  const connectionError = dbError;
  const isRLSEnabled = dbStatus === 'connected';

  // Toggle auto-connect setting
  const toggleAutoConnect = useCallback((enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !autoConnectActive;
    setAutoConnectActive(newValue);
    setAutoConnectDatabase(newValue);
    
    if (newValue && !isAuthenticated && isOnline) {
      // If enabling, try to connect immediately
      checkDbConnection(true);
    }
  }, [autoConnectActive, isAuthenticated, isOnline, checkDbConnection]);
  
  // Add automatic reconnection attempt when connection error is detected
  useEffect(() => {
    if (dbError && isOnline) {
      // Wait a moment and try one automatic reconnection
      const timer = setTimeout(() => {
        console.log("Automatic reconnection attempt after detecting connection error");
        checkDbConnection();
      }, 5000); // 5 second delay
      
      return () => clearTimeout(timer);
    }
  }, [dbError, isOnline, checkDbConnection]);
  
  return {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isRLSEnabled,
    pendingUpdatesCount,
    connectionChecked,
    isConnecting,
    connectionError,
    handleLogin,
    handleSyncPendingUpdates,
    checkDatabaseConnection: checkDbConnection,
    handleForceReconnect,
    autoConnectActive,
    toggleAutoConnect
  };
}

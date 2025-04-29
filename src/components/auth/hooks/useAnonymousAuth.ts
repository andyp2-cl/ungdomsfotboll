
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
    connectionChecked, 
    isConnecting, 
    connectionError, 
    isRLSEnabled, 
    checkDatabaseConnection,
    handleForceReconnect
  } = useConnectionManagement(isOnline);
  
  // Get authentication actions
  const { isAuthenticating, handleLogin } = useAuthenticationActions(isOnline);
  
  // Get offline management
  const { pendingUpdatesCount, handleSyncPendingUpdates } = useOfflineManagement(isOnline);

  // Toggle auto-connect setting
  const toggleAutoConnect = useCallback((enabled?: boolean) => {
    const newValue = enabled !== undefined ? enabled : !autoConnectActive;
    setAutoConnectActive(newValue);
    setAutoConnectDatabase(newValue);
    
    if (newValue && !isAuthenticated && isOnline) {
      // If enabling, try to connect immediately
      checkDatabaseConnection(true);
    }
  }, [autoConnectActive, isAuthenticated, isOnline, checkDatabaseConnection]);
  
  // Add automatic reconnection attempt when connection error is detected
  useEffect(() => {
    if (connectionError && isOnline) {
      // Wait a moment and try one automatic reconnection
      const timer = setTimeout(() => {
        console.log("Automatic reconnection attempt after detecting connection error");
        checkDatabaseConnection();
      }, 5000); // 5 second delay
      
      return () => clearTimeout(timer);
    }
  }, [connectionError, isOnline, checkDatabaseConnection]);
  
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
    checkDatabaseConnection,
    handleForceReconnect,
    autoConnectActive,
    toggleAutoConnect
  };
}

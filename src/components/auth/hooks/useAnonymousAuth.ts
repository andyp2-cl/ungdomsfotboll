
import { useOnlineStatus } from './useOnlineStatus';
import { useSessionState } from './useSessionState';
import { useConnectionManagement } from './useConnectionManagement';
import { useAuthenticationActions } from './useAuthenticationActions';
import { useOfflineManagement } from './useOfflineManagement';
import { useEffect } from 'react';

export function useAnonymousAuth() {
  // Get online status
  const { isOnline } = useOnlineStatus();
  
  // Get session state
  const { isAuthenticated } = useSessionState();
  
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
    handleForceReconnect
  };
}

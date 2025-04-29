
import React, { useEffect } from 'react';
import { useAnonymousAuth } from './hooks/useAnonymousAuth';
import { AuthenticationState } from './components/AuthenticationState';
import { LoginPrompt } from './components/LoginPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Loader2, AlertCircle } from 'lucide-react';

export function AnonymousAuth() {
  const {
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
    checkDatabaseConnection
  } = useAnonymousAuth();
  
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
  
  // Show loading indicator while checking connection
  if (!connectionChecked) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Kontrollerar anslutning...</span>
        </div>
      </div>
    );
  }
  
  // If we're offline, show offline mode button
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <OfflineIndicator 
          handleSyncPendingUpdates={handleSyncPendingUpdates} 
          pendingUpdates={pendingUpdatesCount}
        />
        {connectionError && (
          <div className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            <span title={connectionError}>Databasfel</span>
          </div>
        )}
      </div>
    );
  }
  
  // If we're connecting to the database or have a connection error, show appropriate state
  if (isConnecting || connectionError) {
    return (
      <div className="flex items-center gap-2">
        <OfflineIndicator 
          handleSyncPendingUpdates={handleSyncPendingUpdates}
          isConnecting={isConnecting}
          connectionError={connectionError}
        />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <AuthenticationState 
          isAuthenticated={isAuthenticated}
          isRLSEnabled={isRLSEnabled}
          handleSyncPendingUpdates={handleSyncPendingUpdates}
        />
      ) : (
        <LoginPrompt 
          handleLogin={handleLogin} 
          isAuthenticating={isAuthenticating} 
        />
      )}
    </div>
  );
}

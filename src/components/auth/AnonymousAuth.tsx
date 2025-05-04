
import React, { useEffect } from 'react';
import { useAnonymousAuth } from './hooks/useAnonymousAuth';
import { AuthenticationState } from './components/AuthenticationState';
import { LoginPrompt } from './components/LoginPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Loader2, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

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
    checkDatabaseConnection,
    handleForceReconnect,
    autoConnectActive,
    toggleAutoConnect
  } = useAnonymousAuth();
  
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

  // Auto-connect toggle button  
  const AutoConnectToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      onClick={() => {
        toggleAutoConnect();
        toast.success(autoConnectActive 
          ? "Automatisk DB-åtkomst inaktiverad" 
          : "Automatisk DB-åtkomst aktiverad"
        );
      }}
      title={autoConnectActive 
        ? "Klicka för att inaktivera automatisk DB-åtkomst" 
        : "Klicka för att aktivera automatisk DB-åtkomst"
      }
    >
      {autoConnectActive ? (
        <>
          <ToggleRight className="h-4 w-4 text-green-500" />
          <span className="hidden md:inline">Auto DB</span>
        </>
      ) : (
        <>
          <ToggleLeft className="h-4 w-4 text-gray-500" />
          <span className="hidden md:inline">Auto DB</span>
        </>
      )}
    </Button>
  );
  
  return (
    <div className="flex items-center gap-2">
      <AutoConnectToggle />
      
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

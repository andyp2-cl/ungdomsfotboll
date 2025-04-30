
import React, { useEffect } from 'react';
import { useAnonymousAuth } from './hooks/useAnonymousAuth';
import { AuthenticationState } from './components/AuthenticationState';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

export function AnonymousAuth() {
  const {
    isAuthenticated,
    isRLSEnabled,
    pendingUpdatesCount,
    connectionChecked,
    isConnecting,
    connectionError,
    handleSyncPendingUpdates,
  } = useAnonymousAuth();

  return (
    <div className="flex items-center gap-2">
      {/* If we're offline, show offline mode button */}
      {!connectionChecked ? (
        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
          <span>Kontrollerar anslutning...</span>
        </div>
      ) : isConnecting || connectionError ? (
        <OfflineIndicator 
          handleSyncPendingUpdates={handleSyncPendingUpdates}
          isConnecting={isConnecting}
          connectionError={connectionError}
        />
      ) : isAuthenticated ? (
        <AuthenticationState 
          isAuthenticated={isAuthenticated}
          isRLSEnabled={isRLSEnabled}
          handleSyncPendingUpdates={handleSyncPendingUpdates}
        />
      ) : (
        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Ingen DB-åtkomst</span>
        </div>
      )}
    </div>
  );
}

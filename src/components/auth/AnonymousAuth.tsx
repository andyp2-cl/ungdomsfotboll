
import React, { useEffect } from 'react';
import { useAnonymousAuth } from './hooks/useAnonymousAuth';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AnonymousAuth() {
  const {
    isAuthenticated,
    isOnline,
    pendingUpdatesCount,
    connectionChecked,
    isConnecting,
    connectionError,
    handleSyncPendingUpdates,
    checkDatabaseConnection
  } = useAnonymousAuth();
  
  // Automatically check database connection on load
  useEffect(() => {
    if (!connectionChecked && !isConnecting) {
      checkDatabaseConnection(true);
    }
  }, [connectionChecked, isConnecting, checkDatabaseConnection]);

  // Show loading indicator while checking connection
  if (!connectionChecked) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs flex items-center gap-1.5 text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Ansluter till databasen...</span>
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
          <span className="text-xs text-amber-500">
            {connectionError.includes("DB") ? "DB offline" : "Offline"}
          </span>
        )}
      </div>
    );
  }
  
  // For connected state, just show a minimal indicator
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated && (
        <span className="text-xs text-green-600">DB ansluten</span>
      )}
      {pendingUpdatesCount > 0 && (
        <button 
          onClick={handleSyncPendingUpdates}
          className="text-xs text-blue-600 hover:underline"
        >
          Synka ändringar ({pendingUpdatesCount})
        </button>
      )}
    </div>
  );
}

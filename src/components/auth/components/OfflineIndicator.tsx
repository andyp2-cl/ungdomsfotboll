
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff, Database, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { forceReconnect } from '../utils/databaseUtils';

interface OfflineIndicatorProps {
  handleSyncPendingUpdates: () => void;
  pendingUpdates?: number;
  isConnecting?: boolean;
  connectionError?: string | null;
}

export function OfflineIndicator({ 
  handleSyncPendingUpdates, 
  pendingUpdates = 0, 
  isConnecting = false,
  connectionError = null
}: OfflineIndicatorProps) {
  const [isResetting, setIsResetting] = React.useState(false);
  
  // Handle force reconnect
  const handleForceReconnect = async () => {
    try {
      setIsResetting(true);
      await forceReconnect();
    } finally {
      setIsResetting(false);
    }
  };
  
  // If there's a connection error, display it with more details
  if (connectionError) {
    return (
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-red-600 flex gap-1.5 items-center"
          onClick={handleForceReconnect}
          disabled={isResetting}
          title={connectionError}
        >
          <AlertCircle className="h-4 w-4" />
          <span className="text-xs">Återanslut</span>
          {isResetting ? <Loader2 className="h-3 w-3 ml-1 animate-spin" /> : <RefreshCw className="h-3 w-3 ml-1" />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 flex gap-1 items-center"
          onClick={handleSyncPendingUpdates}
        >
          <Database className="h-3 w-3" />
          <span className="text-xs">Diagnos</span>
        </Button>
      </div>
    );
  }
  
  // If connecting, display connecting state with animated loader
  if (isConnecting) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-amber-600 flex gap-1.5 items-center"
        onClick={handleForceReconnect}
        disabled={isResetting}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">{isResetting ? "Återställer..." : "Ansluter..."}</span>
      </Button>
    );
  }

  // Default offline state with cloud icon
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-amber-600 flex gap-1.5 items-center"
        onClick={handleForceReconnect}
        disabled={isResetting}
      >
        <CloudOff className="h-4 w-4" />
        <span className="text-xs">
          {isResetting ? "Återställer..." : 
            pendingUpdates > 0 ? `Offline (${pendingUpdates} ändringar)` : "Återanslut"}
        </span>
        {isResetting && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
      </Button>
      
      {pendingUpdates > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-600 flex gap-1 items-center"
          onClick={handleSyncPendingUpdates}
        >
          <Database className="h-3 w-3" />
          <span className="text-xs">Synka</span>
        </Button>
      )}
    </div>
  );
}

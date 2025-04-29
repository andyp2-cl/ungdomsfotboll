
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff, Database, Loader2, AlertCircle, RefreshCw } from "lucide-react";

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
  // If there's a connection error, display it with more details
  if (connectionError) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 flex gap-1.5 items-center"
        onClick={handleSyncPendingUpdates}
        title={connectionError}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs">Anslutningsfel</span>
        <RefreshCw className="h-3 w-3 ml-1" />
      </Button>
    );
  }
  
  // If connecting, display connecting state with animated loader
  if (isConnecting) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-amber-600 flex gap-1.5 items-center"
        onClick={handleSyncPendingUpdates}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-xs">Ansluter...</span>
      </Button>
    );
  }

  // Default offline state with cloud icon
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-amber-600 flex gap-1.5 items-center"
      onClick={handleSyncPendingUpdates}
    >
      <CloudOff className="h-4 w-4" />
      <span className="text-xs">
        {pendingUpdates > 0 ? `Offline (${pendingUpdates} ändringar)` : "Offline"}
      </span>
    </Button>
  );
}

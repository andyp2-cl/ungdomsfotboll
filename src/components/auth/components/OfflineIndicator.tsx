
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff, Database, Loader2, AlertCircle } from "lucide-react";

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
  // If there's a connection error, display it
  if (connectionError) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        className="text-red-600 flex gap-1.5 items-center"
        onClick={handleSyncPendingUpdates}
      >
        <AlertCircle className="h-4 w-4" />
        <span className="text-xs">Anslutningsfel</span>
      </Button>
    );
  }
  
  // If connecting, display connecting state
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

  // Default offline state
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

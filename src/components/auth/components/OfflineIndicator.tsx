
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff, Database, Loader2 } from "lucide-react";

interface OfflineIndicatorProps {
  handleSyncPendingUpdates: () => void;
  pendingUpdates?: number;
  isConnecting?: boolean;
}

export function OfflineIndicator({ 
  handleSyncPendingUpdates, 
  pendingUpdates = 0, 
  isConnecting = false 
}: OfflineIndicatorProps) {
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

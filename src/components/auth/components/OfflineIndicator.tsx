
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff } from "lucide-react";

interface OfflineIndicatorProps {
  handleSyncPendingUpdates: () => void;
  pendingUpdates?: number;
}

export function OfflineIndicator({ handleSyncPendingUpdates, pendingUpdates = 0 }: OfflineIndicatorProps) {
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

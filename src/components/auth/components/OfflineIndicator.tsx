
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff } from "lucide-react";

interface OfflineIndicatorProps {
  handleSyncPendingUpdates: () => void;
}

export function OfflineIndicator({ handleSyncPendingUpdates }: OfflineIndicatorProps) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-amber-600 flex gap-1.5 items-center"
      onClick={handleSyncPendingUpdates}
    >
      <CloudOff className="h-4 w-4" />
      <span className="text-xs">Offline</span>
    </Button>
  );
}

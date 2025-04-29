
import React from 'react';
import { Button } from "@/components/ui/button";
import { CloudOff } from "lucide-react";

type OfflineStatusButtonProps = {
  triggerSync: () => void;
};

export function OfflineStatusButton({ triggerSync }: OfflineStatusButtonProps) {
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-amber-600 flex gap-1.5 items-center"
        onClick={triggerSync}
      >
        <CloudOff className="h-4 w-4" />
        <span className="text-xs">Offline</span>
      </Button>
    </div>
  );
}

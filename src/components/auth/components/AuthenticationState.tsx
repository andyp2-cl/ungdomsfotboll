
import React from 'react';
import { useAuthentication } from '../hooks/useAuthentication';
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle } from "lucide-react";

interface AuthenticationStateProps {
  isAuthenticated: boolean;
  isRLSEnabled: boolean;
  handleSyncPendingUpdates: () => void;
}

export function AuthenticationState({ isAuthenticated, isRLSEnabled, handleSyncPendingUpdates }: AuthenticationStateProps) {
  return (
    <>
      <Button 
        variant="ghost" 
        size="sm" 
        className={`flex gap-1.5 items-center ${isRLSEnabled ? "text-green-600" : "text-amber-600"}`}
        disabled
      >
        {isRLSEnabled ? (
          <CheckCircle2 className="h-4 w-4" />
        ) : (
          <XCircle className="h-4 w-4" />
        )}
        <span className="text-xs">
          {isRLSEnabled ? "DB-åtkomst aktiv" : "Begränsad DB-åtkomst"}
        </span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="flex gap-1.5 items-center"
        onClick={handleSyncPendingUpdates}
      >
        <RefreshCw className="h-4 w-4" />
        <span className="text-xs">Synka ändringar</span>
      </Button>
    </>
  );
}

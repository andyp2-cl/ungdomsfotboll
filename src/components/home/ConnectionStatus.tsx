
import React from "react";
import { Database, AlertTriangle, RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { forceReconnect, clearAuthAndReconnect } from "@/components/auth/utils/databaseUtils";

interface ConnectionStatusProps {
  syncStatus: "connected" | "connecting" | "disconnected" | "not-configured";
  isReconnecting: boolean;
  isOnline: boolean;
  setSyncStatus: (status: "connected" | "connecting" | "disconnected" | "not-configured") => void;
}

export const ConnectionStatus = ({ 
  syncStatus, 
  isReconnecting, 
  isOnline,
  setSyncStatus 
}: ConnectionStatusProps) => {
  
  // Force reconnect function with complete reset
  const handleForceReconnect = async () => {
    try {
      setSyncStatus("connecting");
      toast.loading("Återställer databasanslutning...");
      
      // Complete logout and reconnect
      const success = await clearAuthAndReconnect();
      
      // Check connection status again
      if (success) {
        setSyncStatus("connected");
        toast.success("Databasanslutning återupprättad");
      } else {
        setSyncStatus("disconnected");
        toast.error("Kunde inte återupprätta databasanslutning");
      }
      
      // Force reload after connection reset to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error during forced reconnection:", error);
      setSyncStatus("disconnected");
      toast.error("Ett fel uppstod vid återanslutning");
    }
  };

  // Show offline indicator if device is offline
  if (!isOnline) {
    return (
      <span className="flex items-center gap-1 text-orange-600">
        <AlertTriangle className="h-4 w-4" />
        Offline-läge
      </span>
    );
  }

  // Show database connection status
  if (syncStatus === "connected") {
    return (
      <span className="flex items-center gap-1 text-green-600">
        <CheckCircle2 className="h-4 w-4" />
        Databas ansluten
      </span>
    );
  }
  
  if (syncStatus === "connecting") {
    return (
      <span className="flex items-center gap-1 text-amber-600">
        <Database className="h-4 w-4" />
        Ansluter till databas...
      </span>
    );
  }
  
  if (syncStatus === "disconnected" || syncStatus === "not-configured") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className="flex items-center gap-1 text-red-600">
          <Database className="h-4 w-4" />
          Ingen anslutning till databas
        </span>
        <Button 
          variant="outline" 
          size="sm"
          className="mt-1 flex items-center gap-1.5"
          onClick={handleForceReconnect}
          disabled={isReconnecting}
        >
          {isReconnecting ? 
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 
            <RefreshCw className="h-3.5 w-3.5" />}
          Återställ anslutning
        </Button>
      </div>
    );
  }

  return null;
};

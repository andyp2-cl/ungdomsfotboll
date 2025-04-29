
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, Database, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured, initializeSupabaseSession, forceResetConnection } from "@/lib/supabase/client";
import { BackupRestoreActions } from "@/components/backup-restore";
import { toast } from "sonner";
import { forceReconnect } from "@/components/auth/utils/databaseUtils";

const Index = () => {
  const [syncStatus, setSyncStatus] = useState<"connected" | "connecting" | "disconnected" | "not-configured">(
    "connecting"
  );
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Force reconnect function
  const handleForceReconnect = async () => {
    try {
      setIsReconnecting(true);
      setSyncStatus("connecting");
      toast.loading("Återställer databasanslutning...");
      
      // Try both reconnect methods
      const success = await forceReconnect();
      
      if (!success) {
        // Try the more aggressive method
        await forceResetConnection();
      }
      
      // Check connection status again
      const connected = await initializeSupabaseSession();
      setSyncStatus(connected ? "connected" : "disconnected");
      
      if (connected) {
        toast.success("Databasanslutning återupprättad");
      } else {
        toast.error("Kunde inte återupprätta databasanslutning");
      }
    } catch (error) {
      console.error("Error during forced reconnection:", error);
      setSyncStatus("disconnected");
      toast.error("Ett fel uppstod vid återanslutning");
    } finally {
      setIsReconnecting(false);
    }
  };
  
  useEffect(() => {
    // Check if already connected using localStorage
    const connectionTest = localStorage.getItem('sb-connection-test');
    if (connectionTest === 'true') {
      setSyncStatus("connected");
      return;
    }
    
    // Check Supabase connection - with aggressive retry mechanism
    const checkConnection = async (retryCount = 0) => {
      try {
        // First attempt to initialize the session
        const sessionInitialized = await initializeSupabaseSession();
        
        if (sessionInitialized) {
          setSyncStatus("connected");
          localStorage.setItem('sb-connection-test', 'true');
          toast.success("Databasanslutning upprättad");
          return;
        }
        
        // If we have a session but can't access data, try to refresh the session
        if (retryCount < 3) {
          console.log(`Connection attempt failed. Retrying (attempt ${retryCount + 1})...`);
          
          // Force refresh auth session before retrying
          try {
            await supabase.auth.refreshSession();
            console.log("Session refreshed, retrying connection...");
          } catch (refreshError) {
            console.error("Error refreshing session:", refreshError);
          }
          
          // Add slight delay before retry
          setTimeout(() => checkConnection(retryCount + 1), 1000);
          return;
        }
        
        // After multiple failed attempts
        setSyncStatus("disconnected");
        toast.error("Kunde inte ansluta till databasen. Använd återanslutningsknappen.");
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        
        // Still retry if within retry count
        if (retryCount < 3) {
          setTimeout(() => checkConnection(retryCount + 1), 1000);
        } else {
          setSyncStatus("disconnected");
        }
      }
    };
    
    // Start connection process
    checkConnection();
    
    // Set up periodic connection checking for reconnection attempts
    const intervalId = setInterval(() => {
      if (syncStatus !== "connected") {
        // Only recheck if not already connected
        checkConnection();
      }
    }, 30000); // Check every 30 seconds if not connected
    
    return () => clearInterval(intervalId);
  }, [syncStatus]);
  
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-100">
      <div className="text-center p-6 max-w-md mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-[#006633]">Hässleholms IF P2014</h1>
        <p className="text-xl text-gray-600 mb-8">Hantera dina fotbollsspelare och aktiviteter enkelt och smidigt</p>
        
        <div className="flex flex-col items-center gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <Link to="/players" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <Users className="h-5 w-5" />
                Spelare
              </Button>
            </Link>
            
            <Link to="/activities" className="w-full">
              <Button size="lg" className="w-full gap-2 h-16">
                <Calendar className="h-5 w-5" />
                Aktiviteter
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-2 text-sm mt-6">
            {syncStatus === "connected" && (
              <span className="flex items-center gap-1 text-green-600">
                <Database className="h-4 w-4" />
                Databas ansluten
              </span>
            )}
            {syncStatus === "connecting" && (
              <span className="flex items-center gap-1 text-amber-600">
                <Database className="h-4 w-4" />
                Ansluter till databas...
              </span>
            )}
            {(syncStatus === "disconnected" || syncStatus === "not-configured") && (
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
            )}
          </div>
        </div>
      </div>
      
      {/* Backup/Restore section at the bottom of the page - made more prominent */}
      <div className="p-6 bg-white border-t shadow-inner">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Säkerhetskopiering</h2>
          <div className="bg-slate-50 p-4 rounded-lg border shadow-sm">
            <BackupRestoreActions />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Index;

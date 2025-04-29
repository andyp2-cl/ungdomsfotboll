
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, Database, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { BackupRestoreActions } from "@/components/backup-restore";
import { toast } from "sonner";

const Index = () => {
  const [syncStatus, setSyncStatus] = useState<"connected" | "connecting" | "disconnected" | "not-configured">(
    "connecting"
  );
  
  useEffect(() => {
    // Check if already connected using localStorage
    const connectionTest = localStorage.getItem('sb-connection-test');
    if (connectionTest === 'true') {
      setSyncStatus("connected");
      return;
    }
    
    // Check Supabase connection - with retry mechanism
    const checkConnection = async (retryCount = 0) => {
      try {
        // First check if we have an active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Try to access data with the session
          const { data, error } = await supabase.from('leagues').select('count');
          
          if (error) {
            console.error("Supabase connection error with session:", error);
            
            // If we have a session but can't access data, try to refresh the session
            if (retryCount < 2) {
              console.log(`Refreshing session and retrying (attempt ${retryCount + 1})...`);
              await supabase.auth.refreshSession();
              setTimeout(() => checkConnection(retryCount + 1), 1000);
              return;
            }
            
            setSyncStatus("disconnected");
            toast.error("Kunde inte ansluta till databasen. Försök logga in igen.");
          } else {
            setSyncStatus("connected");
            localStorage.setItem('sb-connection-test', 'true');
            toast.success("Databasanslutning upprättad");
          }
        } else if (retryCount < 1) {
          // No session found, but try to check public tables anyway
          const { data, error } = await supabase.from('leagues').select('count');
          
          if (error) {
            // Can't access even public data
            console.error("No session and can't access public data:", error);
            setSyncStatus("disconnected");
          } else {
            // Public data is accessible
            setSyncStatus("connected");
            localStorage.setItem('sb-connection-test', 'true');
          }
        } else {
          setSyncStatus("disconnected");
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setSyncStatus("disconnected");
      }
    };
    
    checkConnection();
    
    // Set up periodic connection checking
    const intervalId = setInterval(() => {
      if (syncStatus !== "connected") {
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
            {syncStatus === "disconnected" && (
              <span className="flex items-center gap-1 text-red-600">
                <Database className="h-4 w-4" />
                Ingen anslutning till databas
              </span>
            )}
            {syncStatus === "not-configured" && (
              <div className="flex flex-col items-center">
                <span className="flex items-center gap-1 text-red-600 mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Supabase konfiguration saknas
                </span>
                <span className="text-xs text-gray-600 max-w-xs">
                  Du behöver konfigurera Supabase URL och anonym nyckel i dina miljövariabler.
                </span>
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

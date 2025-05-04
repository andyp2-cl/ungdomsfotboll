
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Calendar, Database, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { BackupRestoreActions } from "@/components/backup-restore";

const Index = () => {
  const [syncStatus, setSyncStatus] = useState<"connected" | "connecting" | "disconnected" | "not-configured">(
    isSupabaseConfigured() ? "connecting" : "not-configured"
  );
  
  useEffect(() => {
    // Skip connection check if not configured
    if (!isSupabaseConfigured()) {
      return;
    }
    
    // Check Supabase connection
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('players').select('count');
        if (error) {
          console.error("Supabase connection error:", error);
          setSyncStatus("disconnected");
        } else {
          setSyncStatus("connected");
        }
      } catch (err) {
        console.error("Failed to connect to Supabase:", err);
        setSyncStatus("disconnected");
      }
    };
    
    checkConnection();
  }, []);
  
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

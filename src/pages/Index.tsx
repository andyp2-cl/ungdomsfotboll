
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Database } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const Index = () => {
  const [syncStatus, setSyncStatus] = useState<"connected" | "connecting" | "disconnected">("connecting");
  
  useEffect(() => {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Hässleholms IF P2014</h1>
        <p className="text-xl text-gray-600 mb-8">Hantera dina fotbollsspelare och aktiviteter enkelt och smidigt</p>
        
        <div className="flex flex-col items-center gap-4">
          <Link to="/players">
            <Button size="lg" className="gap-2">
              <Users className="h-5 w-5" />
              Visa spelare
            </Button>
          </Link>
          
          <div className="flex items-center gap-2 text-sm">
            <Database className="h-4 w-4" />
            {syncStatus === "connected" && <span className="text-green-600">Databas ansluten</span>}
            {syncStatus === "connecting" && <span className="text-amber-600">Ansluter till databas...</span>}
            {syncStatus === "disconnected" && <span className="text-red-600">Ingen anslutning till databas</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;


import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power, AlertTriangle, Database, ServerCrash } from 'lucide-react';
import { toast } from 'sonner';
import { clearActivitiesCache } from '@/utils/storage/activity/cache-operations';
import { supabase } from '@/lib/supabase/client';

interface DiagnosticToolsProps {
  clearAuthAndReconnect: () => Promise<void>;
  isPerformingReset: boolean;
}

export function DiagnosticTools({ clearAuthAndReconnect, isPerformingReset }: DiagnosticToolsProps) {
  const handleForceClearCache = async () => {
    try {
      toast.loading("Rensar cache och laddar om sidan...");
      
      // Clear activities cache
      clearActivitiesCache();
      
      // Clear localStorage connection test cache
      localStorage.removeItem('sb-activities-fetch-time');
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      
      // Clear service worker cache if available
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        try {
          const messageChannel = new MessageChannel();
          navigator.serviceWorker.controller.postMessage({
            type: 'CLEAR_API_CACHE',
            timestamp: Date.now()
          }, [messageChannel.port2]);
          console.log("Sent cache clear request to service worker");
        } catch (e) {
          console.error("Error communicating with service worker:", e);
        }
      }
      
      toast.success("Cachen rensad. Laddar om sidan...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error("Error clearing cache:", error);
      toast.error("Ett fel uppstod. Försök igen.");
    }
  };
  
  const testDatabaseConnection = async () => {
    try {
      toast.loading("Testar databasanslutning...");
      
      // Test the database connection
      const { data, error } = await supabase
        .from('activities')
        .select('id, name')
        .limit(1);
        
      if (error) {
        console.error("Database connection error:", error);
        toast.error("Kunde inte ansluta till databasen: " + error.message);
      } else {
        console.log("Database connection successful:", data);
        toast.success("Databasanslutning fungerar korrekt!");
      }
    } catch (error) {
      console.error("Error testing database connection:", error);
      toast.error("Ett fel uppstod vid test av databasanslutning");
    }
  };
  
  return (
    <div className="border-t pt-4 mt-6">
      <h3 className="text-base font-medium mb-2">Felsökningsverktyg</h3>
      
      <div className="space-y-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={handleForceClearCache}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rensa cache och ladda om
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={() => {
            // Clear service worker cache and site data
            if ('caches' in window) {
              caches.keys().then(keyList => {
                return Promise.all(keyList.map(key => {
                  return caches.delete(key);
                }));
              });
            }
            
            toast.success("API cache rensad. Laddar om...");
            setTimeout(() => window.location.reload(), 1000);
          }}
        >
          <Database className="h-4 w-4 mr-2 text-blue-600" />
          Rensa API cache
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={testDatabaseConnection}
        >
          <ServerCrash className="h-4 w-4 mr-2 text-green-600" />
          Testa databasanslutning
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={clearAuthAndReconnect}
          disabled={isPerformingReset}
        >
          <Power className="h-4 w-4 mr-2 text-amber-600" />
          Fullständig återställning
        </Button>
        
        <div className="text-xs text-amber-700 p-2 bg-amber-50 rounded mt-2">
          <div className="flex gap-1 items-center mb-1">
            <AlertTriangle className="h-4 w-4" />
            <strong>Fullständig återställning</strong>
          </div>
          Använd detta alternativ om inget annat fungerar. Detta rensar alla cachade 
          data, loggar ut dig och försöker återansluta. Sidan kommer att laddas om.
        </div>
      </div>
    </div>
  );
}

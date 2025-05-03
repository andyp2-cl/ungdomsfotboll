
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power, AlertTriangle, Database, ServerCrash, Bug } from 'lucide-react';
import { toast } from 'sonner';
import { clearActivitiesCache } from '@/utils/storage/activity/cache-operations';
import { supabase } from '@/lib/supabase/client';

interface DiagnosticToolsProps {
  clearAuthAndReconnect: () => Promise<void>;
  isPerformingReset: boolean;
}

export function DiagnosticTools({ clearAuthAndReconnect, isPerformingReset }: DiagnosticToolsProps) {
  const [isTestingDatabase, setIsTestingDatabase] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<any>(null);
  
  const handleForceClearCache = async () => {
    try {
      toast.loading("Rensar cache och laddar om sidan...");
      
      // Clear activities cache
      clearActivitiesCache();
      
      // Clear localStorage connection test cache
      localStorage.removeItem('sb-activities-fetch-time');
      localStorage.removeItem('sb-connection-test');
      localStorage.removeItem('sb-connection-test-time');
      localStorage.removeItem('pending-score-updates');
      
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
    setIsTestingDatabase(true);
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
        setIsTestingDatabase(false);
        return false;
      } else {
        console.log("Database connection successful:", data);
        toast.success("Databasanslutning fungerar korrekt!");
        setIsTestingDatabase(false);
        return true;
      }
    } catch (error) {
      console.error("Error testing database connection:", error);
      toast.error("Ett fel uppstod vid test av databasanslutning");
      setIsTestingDatabase(false);
      return false;
    }
  };
  
  const runDiagnostics = async () => {
    try {
      setIsTestingDatabase(true);
      toast.loading("Kör diagnostik...");
      
      // Check connection
      const isConnected = await testDatabaseConnection();
      
      // Test RLS permissions
      const updateTest = await testRLSPermissions();
      
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      const authStatus = session ? "Authenticated" : "Not authenticated";
      
      const diagnosticInfo = {
        isConnected,
        updateTest,
        authStatus,
        timestamp: new Date().toISOString()
      };
      
      setDiagnosticData(diagnosticInfo);
      
      toast.success("Diagnostik klar");
      setIsTestingDatabase(false);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast.error("Ett fel uppstod under diagnostik");
      setIsTestingDatabase(false);
    }
  };
  
  const testRLSPermissions = async () => {
    try {
      // Try to update a test field on an activity
      const { data: activities } = await supabase
        .from('activities')
        .select('id')
        .limit(1);
      
      if (!activities || activities.length === 0) {
        return { success: false, error: "No activities found" };
      }
      
      const testActivityId = activities[0].id;
      
      // Try to update with a diagnostic field
      const { error } = await supabase
        .from('activities')
        .update({ 
          _diagnostic_test: `test-${Date.now()}`  // This should be ignored by the database
        })
        .eq('id', testActivityId);
      
      if (error) {
        return { 
          success: false, 
          error: error.message,
          details: "RLS policy may be blocking updates"
        };
      }
      
      return { 
        success: true, 
        message: "Update permission test passed"
      };
    } catch (error) {
      console.error("Error testing RLS permissions:", error);
      return { 
        success: false, 
        error: "Exception during RLS test",
        details: error
      };
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
          disabled={isTestingDatabase}
        >
          <ServerCrash className="h-4 w-4 mr-2 text-green-600" />
          Testa databasanslutning
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full justify-start"
          onClick={runDiagnostics}
          disabled={isTestingDatabase}
        >
          <Bug className="h-4 w-4 mr-2 text-purple-600" />
          Kör diagnostik
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
        
        {diagnosticData && (
          <div className="text-xs border p-2 rounded mt-2 bg-gray-50">
            <div className="font-semibold mb-1">Diagnostisk information:</div>
            <div>Anslutning: {diagnosticData.isConnected ? "OK" : "Fel"}</div>
            <div>Uppdatering: {diagnosticData.updateTest?.success ? "OK" : "Fel"}</div>
            <div>Auth: {diagnosticData.authStatus}</div>
            <div className="text-gray-500 mt-1">{diagnosticData.timestamp}</div>
          </div>
        )}
        
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

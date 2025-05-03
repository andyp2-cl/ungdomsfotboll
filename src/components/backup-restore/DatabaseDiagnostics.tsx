
import React, { useState, useEffect } from "react";
import { supabase, isSupabaseConfigured, forceResetConnection } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, RefreshCw, Check, X } from "lucide-react";
import { toast } from "sonner";

export function DatabaseDiagnostics() {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [testResults, setTestResults] = useState<any>(null);
  const [connectionDetails, setConnectionDetails] = useState<any>(null);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load connection details on mount
  useEffect(() => {
    const connectionInfo = {
      lastSuccessfulConnection: localStorage.getItem('sb-connection-test-time') ? 
        new Date(parseInt(localStorage.getItem('sb-connection-test-time')!, 10)).toLocaleString() : 'Okänd',
      lastError: localStorage.getItem('sb-connection-error'),
      cachedMatchCount: localStorage.getItem('match-data-count') || '0',
      cachedActivitiesCount: localStorage.getItem('cachedActivitiesCount') || '0',
      lastUpdate: localStorage.getItem('sb-activities-last-update') ? 
        new Date(parseInt(localStorage.getItem('sb-activities-last-update')!, 10)).toLocaleString() : 'Okänd'
    };
    setConnectionDetails(connectionInfo);
  }, []);

  const clearLocalStorageCache = async () => {
    try {
      setIsClearing(true);
      toast.loading("Rensar alla cachade data...");
      
      // Clear all localStorage items related to data storage
      const keysToRemove = ['cachedActivities', 'cachedActivitiesTime', 'cachedActivitiesCount',
                           'cachedMatchActivities', 'cachedMatchActivitiesTime', 'cachedMatchActivitiesCount',
                           'sb-activities-last-update', 'sb-activities-fetch-time', 'sb-connection-test',
                           'sb-connection-test-time', 'sb-connection-metrics', 'sb-connection-error'];
                           
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // After a brief pause, reload the page
      setTimeout(() => {
        toast.success("All cache rensad, laddar om sidan...");
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error clearing local storage cache:", error);
      toast.error("Fel vid rensning av cache");
    } finally {
      setIsClearing(false);
    }
  };

  const runDiagnostics = async () => {
    try {
      setIsRunningTests(true);
      toast.loading("Kör diagnostik...");

      const results: any = {
        startTime: Date.now(),
        tests: {},
        online: navigator.onLine
      };

      // Step 1: Check if device is online
      results.tests.online = { 
        passed: navigator.onLine,
        name: "Nätverksanslutning"
      };
      
      if (!navigator.onLine) {
        toast.error("Enheten är offline. Anslut till internet först");
        results.online = false;
        setTestResults(results);
        return;
      }

      // Step 2: Check if Supabase client is configured
      try {
        results.tests.configured = {
          name: "Supabase klientkonfiguration",
          inProgress: true
        };
        const isConfigured = await isSupabaseConfigured();
        results.tests.configured.passed = isConfigured;
        results.tests.configured.inProgress = false;
      } catch (error) {
        results.tests.configured.passed = false;
        results.tests.configured.error = error instanceof Error ? error.message : 'Okänt fel';
        results.tests.configured.inProgress = false;
      }

      // Step 3: Test authentication
      try {
        results.tests.auth = {
          name: "Autentisering",
          inProgress: true
        };
        const { data: { session } } = await supabase.auth.getSession();
        results.tests.auth.passed = !!session;
        results.tests.auth.details = session ? { 
          userId: session.user.id,
          expiresAt: new Date(session.expires_at! * 1000).toLocaleString()
        } : null;
        results.tests.auth.inProgress = false;
      } catch (error) {
        results.tests.auth.passed = false;
        results.tests.auth.error = error instanceof Error ? error.message : 'Okänt fel';
        results.tests.auth.inProgress = false;
      }

      // Step 4: Test read access
      try {
        results.tests.readAccess = {
          name: "Läsbehörighet",
          inProgress: true
        };
        const startTime = performance.now();
        const { data, error } = await supabase
          .from('players')
          .select('count')
          .limit(1);
        const queryTime = performance.now() - startTime;
        
        results.tests.readAccess.passed = !error;
        results.tests.readAccess.details = { 
          queryTime: `${queryTime.toFixed(2)}ms`,
          error: error ? error.message : null
        };
        results.tests.readAccess.inProgress = false;
      } catch (error) {
        results.tests.readAccess.passed = false;
        results.tests.readAccess.error = error instanceof Error ? error.message : 'Okänt fel';
        results.tests.readAccess.inProgress = false;
      }

      // Step 5: Test activities fetch specifically
      try {
        results.tests.activitiesFetch = {
          name: "Aktiviteter hämtning",
          inProgress: true
        };
        
        const startTime = performance.now();
        const { data, error } = await supabase
          .from('activities')
          .select('id,name')
          .limit(5);
        const queryTime = performance.now() - startTime;
          
        results.tests.activitiesFetch.passed = !error && Array.isArray(data);
        results.tests.activitiesFetch.details = { 
          queryTime: `${queryTime.toFixed(2)}ms`,
          recordsFound: data?.length || 0,
          error: error ? error.message : null
        };
        results.tests.activitiesFetch.inProgress = false;
      } catch (error) {
        results.tests.activitiesFetch.passed = false;
        results.tests.activitiesFetch.error = error instanceof Error ? error.message : 'Okänt fel';
        results.tests.activitiesFetch.inProgress = false;
      }

      // Gather connection details from localStorage
      const connectionInfo = {
        lastSuccessfulConnection: localStorage.getItem('sb-connection-test-time') ? 
          new Date(parseInt(localStorage.getItem('sb-connection-test-time')!, 10)).toLocaleString() : 'Okänd',
        lastError: localStorage.getItem('sb-connection-error'),
        cachedMatchCount: localStorage.getItem('match-data-count') || '0',
        cachedActivitiesCount: localStorage.getItem('cachedActivitiesCount') || '0',
        lastUpdate: localStorage.getItem('sb-activities-last-update') ? 
          new Date(parseInt(localStorage.getItem('sb-activities-last-update')!, 10)).toLocaleString() : 'Okänd'
      };
      setConnectionDetails(connectionInfo);

      // Complete the tests
      results.endTime = Date.now();
      results.duration = results.endTime - results.startTime;
      setTestResults(results);
      
      // Show summary
      const passedTests = Object.values(results.tests).filter((t: any) => t.passed).length;
      const totalTests = Object.keys(results.tests).length;
      
      if (passedTests === totalTests) {
        toast.success(`Alla ${totalTests} tester passerade!`);
      } else {
        toast.warning(`${passedTests} av ${totalTests} tester passerade`);
      }
    } catch (e) {
      console.error("Error running diagnostics:", e);
      toast.error("Fel vid diagnostik");
    } finally {
      toast.dismiss();
      setIsRunningTests(false);
    }
  };

  const handleForceReconnect = async () => {
    try {
      setIsRunningTests(true);
      toast.loading("Tvingar återanslutning...");
      await forceResetConnection();
      toast.success("Återanslutning slutförd, laddar om sidan...");
      
      // Force reload page after connection reset to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Återanslutning misslyckades");
      console.error("Error during forced reconnection:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  const handleCompleteClear = async () => {
    try {
      setIsRunningTests(true);
      toast.loading("Utför komplett återställning...");
      
      await clearAuthAndReconnect();
      
      toast.success("Återställning slutförd, laddar om sidan...");
      // Force reload page after reset to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      toast.error("Återställning misslyckades");
      console.error("Error during complete reset:", error);
    } finally {
      setIsRunningTests(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Databasdiagnostik
        </CardTitle>
        <CardDescription>
          Diagnostisera problem med databasanslutningen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Network status */}
          <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span>Nätverk:</span> 
            <span className={`flex items-center gap-1 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {isOnline ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Ansluten</span>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <span>Frånkopplad</span>
                </>
              )}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={runDiagnostics} 
              disabled={isRunningTests || isClearing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunningTests ? "Kör tester..." : "Kör diagnostik"}
            </Button>
            <Button 
              onClick={handleForceReconnect} 
              disabled={isRunningTests || isClearing}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Återanslut till DB
            </Button>
            <Button
              onClick={clearLocalStorageCache}
              disabled={isRunningTests || isClearing}
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-50"
            >
              Rensa cache
            </Button>
            <Button 
              onClick={handleCompleteClear} 
              disabled={isRunningTests || isClearing}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Komplett återställning
            </Button>
          </div>

          {/* Test results */}
          {testResults && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Testresultat:</h4>
              <div className="space-y-2">
                {Object.entries(testResults.tests).map(([key, test]: [string, any]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <span>{test.name}:</span>
                    <span className="flex items-center">
                      {test.inProgress ? (
                        "Kör test..."
                      ) : test.passed ? (
                        <span className="text-green-600 flex items-center">
                          <Check className="h-4 w-4 mr-1" />
                          Godkänd
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Misslyckad
                        </span>
                      )}
                    </span>
                  </div>
                ))}
                <div className="text-xs text-gray-500 mt-1">
                  Testtid: {testResults.duration}ms
                </div>
              </div>
            </div>
          )}

          {/* Connection details */}
          {connectionDetails && (
            <div className="mt-2">
              <h4 className="font-medium mb-2">Anslutningsdetaljer:</h4>
              <div className="text-xs space-y-1 bg-gray-50 p-2 rounded">
                <div><strong>Senaste anslutning:</strong> {connectionDetails.lastSuccessfulConnection}</div>
                <div><strong>Cachade aktiviteter:</strong> {connectionDetails.cachedActivitiesCount}</div>
                <div><strong>Cachade matcher:</strong> {connectionDetails.cachedMatchCount}</div>
                <div><strong>Senaste datauppdatering:</strong> {connectionDetails.lastUpdate}</div>
                {connectionDetails.lastError && (
                  <div className="text-red-600"><strong>Senaste fel:</strong> {connectionDetails.lastError}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

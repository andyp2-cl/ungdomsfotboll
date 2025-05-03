
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '../ui/button';
import { fetchActivitiesFromDB } from '@/utils/storage/activity/fetch-operations';
import { toast } from 'sonner';
import { CheckCircle, XCircle, RefreshCw, AlertTriangle, Database, Shield, LogOut, Power } from 'lucide-react';

function DatabaseDiagnostics() {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string; details?: any }>>({});
  const [isPerformingReset, setIsPerformingReset] = useState(false);
  
  // Run diagnostic tests on the database connection
  const runDiagnostics = async () => {
    setIsRunningTests(true);
    setTestResults({});
    
    try {
      // Test 1: Check if online
      const isOnline = navigator.onLine;
      setTestResults(prev => ({ 
        ...prev, 
        online: { 
          success: isOnline, 
          message: isOnline ? 'Enheten är ansluten till internet' : 'Enheten är offline'
        }
      }));
      
      if (!isOnline) {
        toast.error("Din enhet är offline. Anslut till internet först.");
        return;
      }
      
      // Test 2: Check session
      const { data: { session } } = await supabase.auth.getSession();
      setTestResults(prev => ({ 
        ...prev, 
        session: { 
          success: !!session, 
          message: session 
            ? `Session hittad: ${session.user?.email || 'Anonym'}` 
            : 'Ingen aktiv session hittad'
        }
      }));
      
      // Test 3: Check direct API access to Supabase
      try {
        const directResponse = await fetch("https://zkrruihxszziifyogzko.supabase.co/rest/v1/leagues?select=id&limit=1", {
          headers: {
            "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprcnJ1aWh4c3p6aWlmeW9nemtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMxNjQ1NDksImV4cCI6MjA1ODc0MDU0OX0.ct3AMhbgnJg6pOjlACfwPR5n_Nz2pHX5AScfe84YM0U",
            "Content-Type": "application/json"
          }
        });
        
        if (directResponse.ok) {
          const data = await directResponse.json();
          setTestResults(prev => ({ 
            ...prev, 
            directApi: { 
              success: true, 
              message: 'Direkt API-anslutning fungerar', 
              details: data
            }
          }));
        } else {
          const errorText = await directResponse.text();
          throw new Error(`HTTP ${directResponse.status}: ${errorText}`);
        }
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          directApi: { 
            success: false, 
            message: `Direkt API-anslutning misslyckades: ${error instanceof Error ? error.message : String(error)}`
          }
        }));
      }
      
      // Test 4: Try to fetch activities
      try {
        const activities = await fetchActivitiesFromDB({ 
          showToast: false, 
          silent: true,
          forceRefresh: true
        });
        
        setTestResults(prev => ({ 
          ...prev, 
          activities: { 
            success: activities && activities.length > 0, 
            message: activities && activities.length > 0 
              ? `Hämtade ${activities.length} aktiviteter från databasen` 
              : 'Inga aktiviteter hittades i databasen',
            details: {
              count: activities?.length || 0,
              matchCount: activities?.filter(a => a.type === 'match').length || 0
            }
          }
        }));
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          activities: { 
            success: false, 
            message: `Kunde inte hämta aktiviteter: ${error instanceof Error ? error.message : String(error)}`
          }
        }));
      }
      
      // Test 5: Check cache
      try {
        const cachedActivitiesJson = localStorage.getItem('cachedActivities');
        const hasCachedData = !!cachedActivitiesJson;
        
        if (hasCachedData) {
          const cachedActivities = JSON.parse(cachedActivitiesJson);
          setTestResults(prev => ({ 
            ...prev, 
            cache: { 
              success: true, 
              message: `Hittade ${cachedActivities.length} cachade aktiviteter`,
              details: {
                count: cachedActivities.length,
                lastCacheTime: localStorage.getItem('cachedActivitiesTime') 
                  ? new Date(parseInt(localStorage.getItem('cachedActivitiesTime') || '0')).toLocaleString() 
                  : 'Okänd'
              }
            }
          }));
        } else {
          setTestResults(prev => ({ 
            ...prev, 
            cache: { 
              success: false, 
              message: 'Ingen cachad data hittades'
            }
          }));
        }
      } catch (error) {
        setTestResults(prev => ({ 
          ...prev, 
          cache: { 
            success: false, 
            message: `Fel vid kontroll av cache: ${error instanceof Error ? error.message : String(error)}`
          }
        }));
      }
      
      toast.success("Diagnoserna är klara");
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast.error("Ett fel uppstod vid körning av diagnoser");
    } finally {
      setIsRunningTests(false);
    }
  };
  
  // Complex reset operation to completely clear state and reconnect
  const clearAuthAndReconnect = async () => {
    try {
      setIsPerformingReset(true);
      toast.loading("Utför fullständig återställning...");
      
      // Step 1: Clear all localStorage related to authentication and caching
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.startsWith('supabase') || 
          key.startsWith('cached') || 
          key.includes('activities')
        )) {
          keysToRemove.push(key);
        }
      }
      
      console.log(`Clearing ${keysToRemove.length} localStorage items:`, keysToRemove);
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Step 2: Sign out from Supabase
      await supabase.auth.signOut({ scope: 'global' });
      console.log("Signed out of Supabase");
      
      // Step 3: Try to connect anonymously
      try {
        await supabase.auth.signInAnonymously();
        console.log("Signed in anonymously");
      } catch (err) {
        console.error("Anonymous sign-in failed:", err);
      }
      
      toast.success("Återställning slutförd. Laddar om sidan...");
      
      // Step 4: Force reload the page to reset all React state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error during complete reset:", error);
      toast.error("Fel vid återställning");
    } finally {
      setIsPerformingReset(false);
    }
  };
  
  useEffect(() => {
    // Run diagnostics automatically on mount
    runDiagnostics();
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Databasdiagnostik</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostics} 
          disabled={isRunningTests}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'Kör tester...' : 'Kör tester igen'}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {Object.entries(testResults).map(([testId, result]) => (
          <div 
            key={testId} 
            className={`p-3 rounded-lg border ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              <div className="mr-2 mt-0.5">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <div className="font-medium">{testToLabel(testId)}</div>
                <div className="text-sm text-gray-600">{result.message}</div>
                
                {result.details && (
                  <div className="mt-1 p-2 bg-white rounded text-xs">
                    {Object.entries(result.details).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-2">
                        <span className="font-medium">{key}:</span>
                        <span className="col-span-2">{
                          typeof value === 'object' 
                            ? JSON.stringify(value) 
                            : String(value)
                        }</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="border-t pt-4 mt-6">
        <h3 className="text-base font-medium mb-2">Felsökningsverktyg</h3>
        
        <div className="space-y-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-start"
            onClick={() => {
              localStorage.removeItem('sb-activities-fetch-time');
              localStorage.removeItem('sb-connection-test');
              localStorage.removeItem('sb-connection-test-time');
              toast.success("Cachen rensad. Laddar om...");
              setTimeout(() => window.location.reload(), 1000);
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Rensa connection cache och ladda om
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
    </div>
  );
}

// Helper function to convert test IDs to human-readable labels
function testToLabel(testId: string): string {
  const labels: Record<string, string> = {
    online: 'Internet-anslutning',
    session: 'Supabase session',
    directApi: 'Direkt API-åtkomst',
    activities: 'Aktiviteter från databasen',
    cache: 'Lokal cache'
  };
  
  return labels[testId] || testId;
}

export default DatabaseDiagnostics;

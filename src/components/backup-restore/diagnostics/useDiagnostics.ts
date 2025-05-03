
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { fetchActivitiesFromDB } from '@/utils/storage/activity/fetch-operations';
import { toast } from 'sonner';

export type DiagnosticResults = Record<string, { 
  success: boolean; 
  message: string; 
  details?: any 
}>;

export function useDiagnostics() {
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testResults, setTestResults] = useState<DiagnosticResults>({});
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
  
  // Run diagnostics automatically on mount
  useEffect(() => {
    runDiagnostics();
  }, []);
  
  return {
    isRunningTests, 
    testResults, 
    isPerformingReset,
    runDiagnostics,
    clearAuthAndReconnect
  };
}

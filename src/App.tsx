
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PasswordProtection from "./components/PasswordProtection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlayersPage from "./pages/PlayersPage";
import PlayerManagementPage from "./pages/PlayerManagementPage";
import { useSyncEngine } from "./hooks/useSyncEngine";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase, isSupabaseConfigured } from "./lib/supabase/client";
import { LoginStatus } from "./components/auth/LoginStatus";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity, // Prevent automatic refetching
    },
  },
});

function App() {
  const { manualSync } = useSyncEngine();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbConnectionAttempts, setDbConnectionAttempts] = useState(0);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internetanslutning återupprättad");
      // Trigger sync when we're back online
      setTimeout(() => {
        manualSync();
        // Also recheck database connection
        checkDatabaseConnection();
      }, 1000);
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast.warning("Offline-läge aktivt. Ändringar sparas lokalt och synkas när du är online igen.");
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [manualSync]);
  
  // Function to check database connection with retries
  const checkDatabaseConnection = async (attempt = 0) => {
    try {
      setDbConnectionAttempts(prev => prev + 1);
      
      // First check if we have a cached successful connection
      const cachedConnection = localStorage.getItem('sb-connection-test');
      if (cachedConnection === 'true' && attempt === 0) {
        console.log("Found cached successful connection");
        return true;
      }
      
      const isConnected = await isSupabaseConfigured();
      
      if (isConnected) {
        console.log(`Database connection verified on attempt ${attempt + 1}`);
        toast.success("Databasanslutning upprättad");
        return true;
      }
      
      // If not connected and we haven't exceeded max retries
      if (attempt < 2) {
        console.log(`Database connection failed, retrying (${attempt + 1}/3)...`);
        
        // Attempt to refresh the session before retrying
        try {
          await supabase.auth.refreshSession();
        } catch (err) {
          console.error("Error refreshing session during connection retry:", err);
        }
        
        // Wait and try again
        setTimeout(() => checkDatabaseConnection(attempt + 1), 2000);
        return false;
      } else {
        console.log("Maximum database connection attempts reached");
        // Only show warning if we've truly failed after retries
        if (attempt >= 2) {
          toast.warning("Problem med databasanslutningen. Du kanske behöver logga in på nytt.");
        }
        return false;
      }
    } catch (err) {
      console.error("Error checking database connection:", err);
      return false;
    }
  };
  
  // Initialize session on startup with multiple retries
  useEffect(() => {
    // Don't run this effect if we're offline
    if (!isOnline) return;
    
    // Force-refresh the session on app start to ensure we have the latest data
    const initializeSession = async () => {
      try {
        // Check if we already confirmed connection
        const hasConfirmedConnection = localStorage.getItem('sb-connection-test') === 'true';
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Found existing session, refreshing...");
          await supabase.auth.refreshSession();
          
          // After refresh, test database connection
          if (!hasConfirmedConnection) {
            await checkDatabaseConnection();
          }
        } else {
          // No session, but still check if we can access public data
          if (!hasConfirmedConnection) {
            await checkDatabaseConnection();
          }
        }
      } catch (err) {
        console.error("Error initializing session:", err);
      }
    };
    
    initializeSession();
    
    // Set up periodic connection check (every 30 seconds if we haven't confirmed connection)
    const intervalId = setInterval(() => {
      const hasConfirmedConnection = localStorage.getItem('sb-connection-test') === 'true';
      if (!hasConfirmedConnection && dbConnectionAttempts < 5) {
        checkDatabaseConnection();
      } else {
        // Clear interval once we have confirmed connection or tried enough times
        clearInterval(intervalId);
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOnline, dbConnectionAttempts]);
  
  // Show toast if offline at startup
  useEffect(() => {
    if (!isOnline) {
      toast.warning("Du är offline. Ändringar sparas lokalt och synkas när du är online igen.");
    }
    
    // Process any pending local updates on app start
    const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
    if (pendingUpdatesJson) {
      const pendingCount = Object.keys(JSON.parse(pendingUpdatesJson)).length;
      if (pendingCount > 0) {
        if (isOnline) {
          toast.info(`${pendingCount} matchresultat väntar på synkronisering`);
        } else {
          toast.warning(`${pendingCount} matchresultat sparade lokalt`);
        }
      }
    }
  }, [isOnline]);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PasswordProtection>
            <div className="fixed top-0 right-0 p-2 z-50">
              <LoginStatus />
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/players" element={<PlayersPage initialTab="players" />} />
              <Route path="/activities" element={<PlayersPage initialTab="activities" />} />
              <Route path="/statistics" element={<PlayersPage initialTab="statistics" />} />
              <Route path="/player-management" element={<PlayerManagementPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PasswordProtection>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

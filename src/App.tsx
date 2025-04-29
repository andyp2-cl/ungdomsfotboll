
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
import { supabase } from "./integrations/supabase/client";

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
  
  // Check for existing session but don't try anonymous auth anymore
  useEffect(() => {
    const initializeAuth = async () => {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        console.log("Existing session found");
        // If we have a session, check if there are pending syncs that need to be processed
        const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
        if (pendingUpdatesJson) {
          const pendingCount = Object.keys(JSON.parse(pendingUpdatesJson)).length;
          if (pendingCount > 0) {
            console.log(`Found ${pendingCount} pending updates to sync`);
            toast.info(`${pendingCount} ändringar att synkronisera`);
            setTimeout(() => manualSync(), 1000);
          }
        }
      } else {
        console.log("No session found, user will need to log in manually if needed");
      }
    };
    
    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, !!session);
      
      // When a user signs in, try to sync any pending changes
      if (event === 'SIGNED_IN' && session) {
        toast.success("Inloggning lyckades");
        
        // Check for pending updates and sync them
        const pendingUpdatesJson = localStorage.getItem('pendingScoreUpdates');
        if (pendingUpdatesJson) {
          const pendingCount = Object.keys(JSON.parse(pendingUpdatesJson)).length;
          if (pendingCount > 0) {
            toast.info(`Synkroniserar ${pendingCount} matchresultat...`);
            setTimeout(() => manualSync(), 1000);
          }
        }
      }
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [manualSync]);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("Internetanslutning återupprättad");
      // Trigger sync when we're back online
      setTimeout(() => {
        manualSync();
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
  
  // Show toast if offline at startup
  useEffect(() => {
    if (!isOnline) {
      toast.warning("Du är offline. Ändringar sparas lokalt och synkas när du är online igen.");
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PasswordProtection>
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

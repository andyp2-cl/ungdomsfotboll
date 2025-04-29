
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

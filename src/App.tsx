import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PasswordProtection from "./components/PasswordProtection";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PlayersPage from "./pages/PlayersPage";
import ActivitiesPage from "./pages/ActivitiesPage";
import PlayerDetail from "./pages/PlayerDetail";
import ActivityDetail from "./pages/ActivityDetail";
import PlayerManagementPage from "./pages/PlayerManagementPage";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Create a QueryClient with basic configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

function App() {
  // Basic online status tracking
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    // Set up event listeners for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Show offline toast once on startup if needed
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
        <Router>
          <PasswordProtection>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/players" element={<PlayersPage />} />
              <Route path="/activities" element={<ActivitiesPage />} />
              <Route path="/players/:id" element={<PlayerDetail />} />
              <Route path="/activities/:id" element={<ActivityDetail />} />
              <Route path="/player-management" element={<PlayerManagementPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PasswordProtection>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PasswordProtection from "./components/PasswordProtection";
import NotFound from "./pages/NotFound";
import PlayersPage from "./pages/PlayersPage";
import PlayerManagementPage from "./pages/PlayerManagementPage";
import TeamSelectionPage from "./pages/TeamSelectionPage";
import { ErrorBoundary } from "./components/ErrorBoundary";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: 1,
      meta: {
        onError: (error) => {
          console.error("Query error:", error);
        }
      }
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PasswordProtection>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Navigate to="/players" replace />} />
                <Route path="/players" element={<PlayersPage initialTab="players" />} />
                <Route path="/activities" element={<PlayersPage initialTab="activities" />} />
                <Route path="/statistics" element={<PlayersPage initialTab="statistics" />} />
                <Route path="/development" element={<PlayersPage initialTab="development" />} />
                <Route path="/training" element={<PlayersPage initialTab="training" />} />
                <Route path="/excel" element={<PlayersPage initialTab="excel" />} />
                <Route path="/player-management" element={<PlayerManagementPage />} />
                <Route path="/team-selection" element={<PlayersPage initialTab="team-selection" />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </PasswordProtection>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;

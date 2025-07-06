import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import NotFound from "./pages/NotFound";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { PageLoader } from "@/components/ui/LoadingSpinner";
import { AuthProvider, useAuth } from "@/integrations/supabase/auth";
import { LoginForm } from "@/components/auth/LoginForm";

// Lazy load pages for better performance
const PlayersPage = lazy(() => import("./pages/PlayersPage"));
const PlayerManagementPage = lazy(() => import("./pages/PlayerManagementPage"));
const TeamSelectionPage = lazy(() => import("./pages/TeamSelectionPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const TeamRegistrationPage = lazy(() => import("./pages/TeamRegistrationPage"));
const AdminPage = lazy(() => import("./pages/AdminPage"));

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

const ProtectedRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) return <LoginForm />;
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <ErrorBoundary>
                  <Routes>
          <Route path="/" element={<Navigate to="/players" replace />} />
          <Route path="/players" element={<PlayersPage initialTab="players" />} />
          <Route path="/activities" element={<PlayersPage initialTab="activities" />} />
          <Route path="/cups" element={<PlayersPage initialTab="cups" />} />
          <Route path="/statistics" element={<PlayersPage initialTab="statistics" />} />
          <Route path="/development" element={<PlayersPage initialTab="development" />} />
          <Route path="/training" element={<PlayersPage initialTab="training" />} />
          <Route path="/excel" element={<PlayersPage initialTab="excel" />} />
          <Route path="/player-management" element={<PlayerManagementPage />} />
          <Route path="/team-selection" element={<PlayersPage initialTab="team-selection" />} />
          <Route path="/team-registration" element={<TeamRegistrationPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </ErrorBoundary>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<ProtectedRoutes />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </AuthProvider>
);

export default App;

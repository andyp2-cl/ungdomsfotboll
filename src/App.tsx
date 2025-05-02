
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayersPage from "./pages/PlayersPage";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import { connectAnonymously, clearAuthAndReconnect } from "./components/auth/utils/databaseUtils";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";

// Create a client with enhanced retry logic
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  // Track auth state
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Attempt to connect automatically when the app starts
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log("Attempting automatic database connection");
        setIsCheckingAuth(true);
        
        // First check if there's an existing connection (cached)
        const existingConnection = localStorage.getItem('sb-connection-test');
        if (existingConnection === 'true') {
          console.log("Using existing database connection from cache");
          setIsAuthenticated(true);
          return;
        }
        
        // Try to connect, and if it fails, use cached data silently
        try {
          console.log("Attempting to connect to database...");
          const connected = await connectAnonymously();
          
          if (connected) {
            console.log("Successfully connected to database");
            setIsAuthenticated(true);
          } else {
            console.log("Connection failed, using cached data if available");
            // Continue without showing errors
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Error connecting to database:", error);
          // Continue without showing errors
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Error in database connection process:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    connectToDatabase();
    
    // Listen for online/offline events to reconnect when coming back online
    const handleOnline = () => {
      console.log("Device is back online, attempting to reconnect to database");
      connectToDatabase();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout isCheckingAuth={isCheckingAuth} isAuthenticated={isAuthenticated}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/players" element={<PlayersPage initialTab="players" />} />
            <Route path="/activities" element={<PlayersPage initialTab="activities" />} />
          </Routes>
        </Layout>
        <Toaster />
        <SonnerToaster position="top-right" expand={true} richColors />
      </Router>
    </QueryClientProvider>
  );
}

export default App;

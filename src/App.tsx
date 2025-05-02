
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayersPage from "./pages/PlayersPage";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import { connectAnonymously, clearAuthAndReconnect } from "./components/auth/utils/databaseUtils";
import { Toaster as SonnerToaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  // Attempt to connect automatically when the app starts
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log("Attempting automatic database connection");
        
        // First check if there's an existing connection
        const existingConnection = localStorage.getItem('sb-connection-test');
        if (existingConnection === 'true') {
          console.log("Using existing database connection from cache");
          return;
        }
        
        // Try to connect, and if it fails, try a full reset
        const connected = await connectAnonymously();
        
        if (!connected) {
          console.log("Initial connection failed, trying a full reset...");
          await clearAuthAndReconnect();
        }
        
        console.log("Automatic database connection process completed");
      } catch (error) {
        console.error("Error connecting to database:", error);
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
        <Layout>
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

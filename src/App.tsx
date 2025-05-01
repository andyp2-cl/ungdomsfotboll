
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayersPage from "./pages/PlayersPage";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/toaster";
import { connectAnonymously } from "./components/auth/utils/databaseUtils";
import { Toaster as SonnerToaster } from "sonner";

function App() {
  // Attempt to connect automatically when the app starts
  useEffect(() => {
    const connectToDatabase = async () => {
      try {
        console.log("Attempting automatic database connection");
        await connectAnonymously();
        console.log("Automatic database connection successful");
      } catch (error) {
        console.error("Error connecting to database:", error);
      }
    };
    
    connectToDatabase();
  }, []);
  
  return (
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
  );
}

export default App;

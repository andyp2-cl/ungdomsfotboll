
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import PlayersPage from "./pages/PlayersPage";
import { getStoredPlayers, getStoredActivities, setStoredPlayers, setStoredActivities } from "./utils/storage";
import { mockPlayers, mockActivities } from "./data/mockData";
import NotFound from "./pages/NotFound";
import CalendarPage from "./pages/CalendarPage";
import PasswordProtection from "./components/PasswordProtection";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeData = async () => {
      // Initialize mock data if localStorage is empty
      if (!localStorage.getItem("players")) {
        await setStoredPlayers(mockPlayers);
      }
      
      if (!localStorage.getItem("activities")) {
        await setStoredActivities(mockActivities);
      }
      
      setIsLoading(false);
    };
    
    initializeData();
  }, []);
  
  if (isLoading) {
    return <div>Laddar...</div>;
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasswordProtection><Index /></PasswordProtection>} />
        <Route path="/players" element={<PasswordProtection><PlayersPage initialTab="players" /></PasswordProtection>} />
        <Route path="/activities" element={<PasswordProtection><PlayersPage initialTab="activities" /></PasswordProtection>} />
        <Route path="/calendar" element={<PasswordProtection><CalendarPage /></PasswordProtection>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

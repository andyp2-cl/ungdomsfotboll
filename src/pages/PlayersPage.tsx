import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PlayerList from "@/components/PlayerList";
import ActivityList from "@/components/ActivityList";
import { Player, Activity } from "@/types/player";
import { mockActivities, aprilActivities } from "@/data/mockData";
import { getStoredPlayers, saveActivities, getStoredActivities, saveActiveTab, getActiveTab } from "@/utils/storage";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { useMobile } from "@/hooks/use-mobile";

// Define the missing storage key constants
const PLAYERS_STORAGE_KEY = "football-app-players";
const ACTIVITIES_STORAGE_KEY = "football-app-activities";

interface PlayersPageProps {
  initialTab?: string;
}

const PlayersPage: React.FC<PlayersPageProps> = ({ initialTab }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState(initialTab || "players");
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    saveActiveTab(tab);
    navigate(`/${tab}`);
  };

  useEffect(() => {
    const storedPlayers = getStoredPlayers();
    setPlayers(storedPlayers);

    const storedActivities = getStoredActivities();
    setActivities(storedActivities);
  }, []);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === PLAYERS_STORAGE_KEY) {
        try {
          const newPlayers = event.newValue ? JSON.parse(event.newValue) : [];
          setPlayers(newPlayers);
        } catch (error) {
          console.error("Error parsing players from storage event:", error);
        }
      } else if (event.key === ACTIVITIES_STORAGE_KEY) {
        try {
          const newActivities = event.newValue ? JSON.parse(event.newValue) : [];
          setActivities(newActivities);
        } catch (error) {
          console.error("Error parsing activities from storage event:", error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const path = location.pathname.slice(1);
    if (path === "players" || path === "activities") {
      setActiveTab(path);
    }
  }, [location.pathname]);

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="w-full justify-center">
        <TabsTrigger value="players">Spelare</TabsTrigger>
        <TabsTrigger value="activities">Aktiviteter</TabsTrigger>
      </TabsList>
      <TabsContent value="players" className="space-y-4">
        <ScrollArea className="h-[500px] w-full rounded-md border">
          <PlayerList players={players} setPlayers={setPlayers} />
        </ScrollArea>
      </TabsContent>
      <TabsContent value="activities" className="space-y-4">
        <ScrollArea className="h-[500px] w-full rounded-md border">
          <ActivityList activities={activities} setActivities={setActivities} players={players} />
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};

export default PlayersPage;

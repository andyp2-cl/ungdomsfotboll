
import { Player, Activity } from "@/types/player";
import { mockPlayers } from "@/data/mockData";

const PLAYERS_STORAGE_KEY = "football-app-players";
const ACTIVITIES_STORAGE_KEY = "football-app-activities";
const ACTIVE_TAB_STORAGE_KEY = "football-app-active-tab";

// Hämta spelare från localStorage eller använd mockdata som fallback
export const getStoredPlayers = (): Player[] => {
  try {
    const storedPlayers = localStorage.getItem(PLAYERS_STORAGE_KEY);
    if (storedPlayers) {
      return JSON.parse(storedPlayers);
    }
    // Om inga lagrade spelare finns, använd mockdata och spara dem
    savePlayers(mockPlayers);
    return mockPlayers;
  } catch (error) {
    console.error("Fel vid hämtning av spelardata:", error);
    return mockPlayers;
  }
};

// Spara spelare till localStorage
export const savePlayers = (players: Player[]): void => {
  try {
    localStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  } catch (error) {
    console.error("Fel vid sparande av spelardata:", error);
  }
};

// Hämta aktiviteter från localStorage
export const getStoredActivities = (): Activity[] => {
  try {
    const storedActivities = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (storedActivities) {
      return JSON.parse(storedActivities);
    }
    return [];
  } catch (error) {
    console.error("Fel vid hämtning av aktivitetsdata:", error);
    return [];
  }
};

// Spara aktiviteter till localStorage
export const saveActivities = (activities: Activity[]): void => {
  try {
    localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  } catch (error) {
    console.error("Fel vid sparande av aktivitetsdata:", error);
  }
};

// Spara aktiv tab till localStorage
export const saveActiveTab = (tab: string): void => {
  try {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
  } catch (error) {
    console.error("Fel vid sparande av aktiv tab:", error);
  }
};

// Hämta aktiv tab från localStorage
export const getActiveTab = (): string => {
  try {
    const tab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return tab || "players"; // Default to "players" if no stored tab
  } catch (error) {
    console.error("Fel vid hämtning av aktiv tab:", error);
    return "players";
  }
};

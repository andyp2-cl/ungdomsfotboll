
import { Player, Activity } from "@/types/player";
import { mockPlayers } from "@/data/mockData";

const PLAYERS_STORAGE_KEY = "football-app-players";
const ACTIVITIES_STORAGE_KEY = "football-app-activities";
const ACTIVE_TAB_STORAGE_KEY = "football-app-active-tab";

// Helper function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error accessing localStorage for key ${key}:`, error);
      return null;
    }
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting localStorage for key ${key}:`, error);
      return false;
    }
  }
};

// Get players from localStorage or use mockdata as fallback
export const getStoredPlayers = (): Player[] => {
  const storedPlayers = safeLocalStorage.getItem(PLAYERS_STORAGE_KEY);
  if (storedPlayers) {
    try {
      return JSON.parse(storedPlayers);
    } catch (error) {
      console.error("Error parsing player data:", error);
    }
  }
  
  // If no stored players or parsing failed, use mockdata and save it
  savePlayers(mockPlayers);
  return mockPlayers;
};

// Save players to localStorage
export const savePlayers = (players: Player[]): void => {
  safeLocalStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
};

// Get activities from localStorage
export const getStoredActivities = (): Activity[] => {
  const storedActivities = safeLocalStorage.getItem(ACTIVITIES_STORAGE_KEY);
  if (storedActivities) {
    try {
      return JSON.parse(storedActivities);
    } catch (error) {
      console.error("Error parsing activity data:", error);
    }
  }
  return [];
};

// Save activities to localStorage
export const saveActivities = (activities: Activity[]): void => {
  safeLocalStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
};

// Save active tab to localStorage
export const saveActiveTab = (tab: string): void => {
  safeLocalStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
};

// Get active tab from localStorage
export const getActiveTab = (): string => {
  const tab = safeLocalStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  return tab || "players"; // Default to "players" if no stored tab
};

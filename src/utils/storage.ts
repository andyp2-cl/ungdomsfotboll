
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
      // Force a storage event to sync across tabs/windows
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: value,
        storageArea: localStorage
      }));
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
      const parsedPlayers = JSON.parse(storedPlayers);
      console.log("Retrieved players from localStorage:", parsedPlayers.length);
      return parsedPlayers;
    } catch (error) {
      console.error("Error parsing player data:", error);
    }
  }
  
  // If no stored players or parsing failed, use mockdata and save it
  console.log("Using mock players data as fallback");
  savePlayers(mockPlayers);
  return mockPlayers;
};

// Save players to localStorage
export const savePlayers = (players: Player[]): void => {
  console.log("Saving players to localStorage:", players.length);
  const success = safeLocalStorage.setItem(PLAYERS_STORAGE_KEY, JSON.stringify(players));
  if (!success) {
    console.error("Failed to save players to localStorage");
  }
};

// Get activities from localStorage
export const getStoredActivities = (): Activity[] => {
  const storedActivities = safeLocalStorage.getItem(ACTIVITIES_STORAGE_KEY);
  if (storedActivities) {
    try {
      const parsedActivities = JSON.parse(storedActivities);
      console.log("Retrieved activities from localStorage:", parsedActivities.length);
      return parsedActivities;
    } catch (error) {
      console.error("Error parsing activity data:", error);
    }
  }
  console.log("No activities found in localStorage");
  return [];
};

// Save activities to localStorage
export const saveActivities = (activities: Activity[]): void => {
  console.log("Saving activities to localStorage:", activities.length);
  const success = safeLocalStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(activities));
  if (!success) {
    console.error("Failed to save activities to localStorage");
  }
};

// Save active tab to localStorage
export const saveActiveTab = (tab: string): void => {
  console.log("Saving active tab to localStorage:", tab);
  safeLocalStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
};

// Get active tab from localStorage
export const getActiveTab = (): string => {
  const tab = safeLocalStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
  return tab || "players"; // Default to "players" if no stored tab
};

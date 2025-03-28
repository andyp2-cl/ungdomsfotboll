
import { Player } from "@/types/player";
import { mockPlayers } from "@/data/mockData";

const PLAYERS_STORAGE_KEY = "football-app-players";

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

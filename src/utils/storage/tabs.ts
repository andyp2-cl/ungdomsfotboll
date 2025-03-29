
const ACTIVE_TAB_STORAGE_KEY = "football-app-active-tab";

// For the active tab, we'll still use localStorage since this is just UI state
// and doesn't need to be shared across devices
export const saveActiveTab = (tab: string): void => {
  console.log("Saving active tab to localStorage:", tab);
  try {
    localStorage.setItem(ACTIVE_TAB_STORAGE_KEY, tab);
  } catch (error) {
    console.error(`Error saving active tab:`, error);
  }
};

export const getActiveTab = (): string => {
  try {
    const tab = localStorage.getItem(ACTIVE_TAB_STORAGE_KEY);
    return tab || "players"; // Default to "players" if no stored tab
  } catch (error) {
    console.error(`Error getting active tab:`, error);
    return "players";
  }
};

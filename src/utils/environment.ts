
/**
 * Environment utility functions for the application
 */

// Local storage key for auto-connect database setting
const AUTO_CONNECT_KEY = 'auto-connect-database';

/**
 * Check if the application is running in development mode
 */
export const isDevelopmentEnvironment = (): boolean => {
  return import.meta.env.MODE === 'development' || 
         import.meta.env.DEV === true ||
         window.location.hostname === 'localhost';
};

/**
 * Check if automatic database connection should be attempted
 */
export const shouldAutoConnectDatabase = (): boolean => {
  // Check local storage first
  const storedPref = localStorage.getItem(AUTO_CONNECT_KEY);
  
  if (storedPref !== null) {
    return storedPref === 'true';
  }
  
  // Default to true in development, false in production
  return isDevelopmentEnvironment();
};

/**
 * Set automatic database connection preference
 */
export const setAutoConnectDatabase = (enabled: boolean): void => {
  localStorage.setItem(AUTO_CONNECT_KEY, enabled ? 'true' : 'false');
};


/**
 * Environment utility functions
 */

// Flag to control automatic database connection
let autoConnectEnabled = true;

/**
 * Check if we should automatically connect to the database
 */
export function shouldAutoConnectDatabase(): boolean {
  return autoConnectEnabled;
}

/**
 * Set whether we should automatically connect to the database
 */
export function setAutoConnectDatabase(enabled: boolean): void {
  autoConnectEnabled = enabled;
  localStorage.setItem('autoConnectDatabase', enabled ? 'true' : 'false');
}

/**
 * Check if we're in a development environment
 */
export function isDevelopmentEnvironment(): boolean {
  return import.meta.env.DEV || window.location.hostname === 'localhost';
}

// Initialize from localStorage if available
if (typeof window !== 'undefined') {
  const storedPreference = localStorage.getItem('autoConnectDatabase');
  if (storedPreference !== null) {
    autoConnectEnabled = storedPreference === 'true';
  } else {
    // Default to true and save preference
    localStorage.setItem('autoConnectDatabase', 'true');
  }
}

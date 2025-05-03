/**
 * Helper functions for environment detection
 */

/**
 * Check if the application is running in development mode
 * Uses URL to determine environment since process.env is not available in browser
 */
export function isDevelopmentEnvironment(): boolean {
  // Check if running locally (localhost) or on a Lovable development domain
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // For more reliability, we can also check for specific development URLs
  const isDevelopmentUrl = 
    window.location.hostname.includes('.lovable.app') || 
    isLocalhost || 
    window.location.hostname.includes('.vercel.app');
    
  return isDevelopmentUrl;
}

/**
 * Check if the application is running in the published production environment
 * This helps distinguish between the official published site and development environments
 */
export function isPublishedEnvironment(): boolean {
  // The published site has a specific domain
  return window.location.hostname === 'hassleholmsifp2014.lovable.app' || 
         window.location.hostname === 'p2014.hifungdom.se';
}

/**
 * Check if automatic database connection should be enabled
 */
export function shouldAutoConnectDatabase(): boolean {
  // First check if user is authenticated with the main password
  const isAuthenticated = localStorage.getItem('hifp2014-auth') === 'true';
  
  // If authenticated with main password, always auto-connect
  if (isAuthenticated) {
    return true;
  }
  
  // Otherwise, read from localStorage to allow user override
  const userPreference = localStorage.getItem('autoConnectDatabase');
  
  // If user has explicitly set a preference, use that
  if (userPreference !== null) {
    return userPreference === 'true';
  }
  
  // Otherwise, auto-connect in development by default
  return isDevelopmentEnvironment();
}

/**
 * Set auto-connect database preference
 */
export function setAutoConnectDatabase(enabled: boolean): void {
  localStorage.setItem('autoConnectDatabase', enabled ? 'true' : 'false');
}

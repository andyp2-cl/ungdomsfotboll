
import { useState, useEffect } from 'react';

export function useAuthenticationState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // In a real app, we would check with Supabase auth
  // For now, we'll just assume we're authenticated if localStorage has a session key
  useEffect(() => {
    const checkAuth = () => {
      const hasSession = localStorage.getItem('supabase.auth.token') !== null;
      
      // For demo purposes, assume we're authenticated
      setIsAuthenticated(true); // Hardcoded for now
    };
    
    checkAuth();
    
    // Listen for auth state changes (in a real app)
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);
  
  return { isAuthenticated };
}

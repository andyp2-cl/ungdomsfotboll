
import { useSessionManagement } from "./useSessionManagement";
import { useConnectionState } from "./useConnectionState";
import { useAuthActions } from "./useAuthActions";
import { testDatabaseAccess } from "../utils/databaseUtils";

export function useAuthentication() {
  // Get connection state
  const { isOnline } = useConnectionState();
  
  // Get session management
  const { 
    isAuthenticated, 
    isInitializing, 
    session, 
    user,
    rememberLogin,
    setRememberLogin
  } = useSessionManagement();
  
  // Get auth actions
  const { 
    isAuthenticating,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    handleLogin,
    handleLogout,
    triggerSync
  } = useAuthActions(isOnline);
  
  return {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isInitializing,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    session,
    user,
    rememberLogin,
    setRememberLogin,
    handleLogin,
    handleLogout,
    triggerSync,
    testDatabaseAccess
  };
}

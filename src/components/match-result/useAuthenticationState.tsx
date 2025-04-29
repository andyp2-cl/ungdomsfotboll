
import { useAuthentication } from "@/components/auth/hooks/useAuthentication";

export function useAuthenticationState() {
  const {
    isAuthenticated,
    isAuthenticating: isAuthLoading,
    user: authUser,
    handleLogin: loginWithMagicLink,
    handleLogout: logout,
    triggerSync // Make sure triggerSync is exposed
  } = useAuthentication();
  
  return { 
    isAuthenticated,
    isAuthLoading,
    authUser,
    loginWithMagicLink,
    logout,
    triggerSync
  };
}

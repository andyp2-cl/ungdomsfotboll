
import React from 'react';
import { useAuthentication } from './hooks/useAuthentication';
import { OfflineStatusButton } from './components/OfflineStatusButton';
import { LoginForm } from './components/LoginForm';
import { LoginButton } from './components/LoginButton';
import { AuthenticatedControls } from './components/AuthenticatedControls';

export function LoginStatus() {
  const {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    user,
    rememberLogin,
    setRememberLogin,
    handleLogin,
    handleLogout,
    triggerSync
  } = useAuthentication();

  // If we're offline, show offline mode button
  if (!isOnline) {
    return <OfflineStatusButton triggerSync={triggerSync} />;
  }
  
  if (showLogin) {
    return (
      <LoginForm
        email={email}
        setEmail={setEmail}
        rememberLogin={rememberLogin}
        setRememberLogin={setRememberLogin}
        handleLogin={handleLogin}
        isAuthenticating={isAuthenticating}
        setShowLogin={setShowLogin}
      />
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <AuthenticatedControls 
          user={user}
          triggerSync={triggerSync}
          handleLogout={handleLogout}
        />
      ) : (
        <LoginButton setShowLogin={setShowLogin} />
      )}
    </div>
  );
}

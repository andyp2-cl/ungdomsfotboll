
import React from 'react';
import { useAnonymousAuth } from './hooks/useAnonymousAuth';
import { AuthenticationState } from './components/AuthenticationState';
import { LoginPrompt } from './components/LoginPrompt';
import { OfflineIndicator } from './components/OfflineIndicator';

export function AnonymousAuth() {
  const {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    isRLSEnabled,
    handleLogin,
    handleSyncPendingUpdates
  } = useAnonymousAuth();
  
  // If we're offline, show offline mode button
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2">
        <OfflineIndicator handleSyncPendingUpdates={handleSyncPendingUpdates} />
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <AuthenticationState 
          isAuthenticated={isAuthenticated}
          isRLSEnabled={isRLSEnabled}
          handleSyncPendingUpdates={handleSyncPendingUpdates}
        />
      ) : (
        <LoginPrompt 
          handleLogin={handleLogin} 
          isAuthenticating={isAuthenticating} 
        />
      )}
    </div>
  );
}

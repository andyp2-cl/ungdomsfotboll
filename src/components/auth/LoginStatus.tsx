
import React, { useState } from 'react';
import { useAuthentication } from './hooks/useAuthentication';
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, LogOut, Wifi, WifiOff, Database, ToggleLeft, ToggleRight } from "lucide-react";
import { shouldAutoConnectDatabase, setAutoConnectDatabase } from '@/utils/environment';
import { toast } from 'sonner';

export function LoginStatus() {
  const {
    isAuthenticated,
    isAuthenticating,
    isOnline,
    user,
    email,
    setEmail,
    showLogin,
    setShowLogin,
    rememberLogin,
    setRememberLogin,
    handleLogin,
    handleLogout,
    triggerSync
  } = useAuthentication();
  
  const [autoConnect, setAutoConnect] = useState(shouldAutoConnectDatabase());
  
  const toggleAutoConnect = () => {
    const newValue = !autoConnect;
    setAutoConnect(newValue);
    setAutoConnectDatabase(newValue);
    toast.success(newValue 
      ? "Automatisk DB-åtkomst aktiverad" 
      : "Automatisk DB-åtkomst inaktiverad"
    );
  };

  // If offline, show offline mode indicator
  if (!isOnline) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="flex gap-1.5 items-center text-yellow-600"
        onClick={triggerSync}
      >
        <WifiOff className="h-4 w-4" />
        <span className="text-xs">Offline-läge</span>
      </Button>
    );
  }
  
  // If showing login form
  if (showLogin) {
    return (
      <div className="bg-white p-4 rounded shadow-md">
        <h3 className="font-medium mb-2">Logga in för databasåtkomst</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-2">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded text-sm"
              placeholder="E-post"
              required
            />
          </div>
          <div className="mb-3 flex items-center">
            <input 
              type="checkbox" 
              id="rememberLogin"
              checked={rememberLogin}
              onChange={(e) => setRememberLogin(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="rememberLogin" className="text-xs text-gray-600">Kom ihåg inloggning</label>
          </div>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              type="button" 
              onClick={() => setShowLogin(false)}
            >
              Avbryt
            </Button>
            <Button 
              size="sm" 
              type="submit" 
              disabled={isAuthenticating}
            >
              {isAuthenticating ? 'Skickar...' : 'Skicka länk'}
            </Button>
          </div>
        </form>
      </div>
    );
  }
  
  // Auto-connect toggle button
  const AutoConnectToggle = () => (
    <Button
      variant="ghost"
      size="sm"
      className="flex items-center gap-1.5 text-xs"
      onClick={toggleAutoConnect}
      title={autoConnect 
        ? "Klicka för att inaktivera automatisk DB-åtkomst" 
        : "Klicka för att aktivera automatisk DB-åtkomst"
      }
    >
      {autoConnect ? (
        <>
          <ToggleRight className="h-4 w-4 text-green-500" />
          <span>Auto DB</span>
        </>
      ) : (
        <>
          <ToggleLeft className="h-4 w-4 text-gray-500" />
          <span>Auto DB</span>
        </>
      )}
    </Button>
  );
  
  // Default state - either logged in or login button
  return (
    <div className="flex items-center gap-2">
      <AutoConnectToggle />
      
      {isAuthenticated ? (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-green-600 flex gap-1.5 items-center"
            disabled
          >
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-xs">
              {user?.email ? `Inloggad (${user.email.split('@')[0]})` : 'Inloggad'}
            </span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex gap-1.5 items-center"
            onClick={triggerSync}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="text-xs">Synka ändringar</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-1.5 items-center text-red-600 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            <span className="text-xs">Logga ut</span>
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="flex gap-1.5 items-center"
          onClick={() => setShowLogin(true)}
        >
          <Database className="h-4 w-4" />
          <span className="text-xs">Aktivera DB-åtkomst</span>
        </Button>
      )}
    </div>
  );
}

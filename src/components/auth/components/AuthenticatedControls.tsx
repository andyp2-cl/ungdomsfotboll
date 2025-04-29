
import React from 'react';
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw, LogOut } from "lucide-react";
import { User } from '@supabase/supabase-js';

type AuthenticatedControlsProps = {
  user: User | null;
  triggerSync: () => void;
  handleLogout: () => Promise<boolean>;
};

export function AuthenticatedControls({ user, triggerSync, handleLogout }: AuthenticatedControlsProps) {
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  
  const onLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log("Logout button clicked");
      await handleLogout();
      // Note: The page will be reloaded by handleLogout on success
    } catch (error) {
      console.error("Error during logout:", error);
      setIsLoggingOut(false);
    }
  };

  return (
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
        onClick={onLogout}
        disabled={isLoggingOut}
      >
        <LogOut className="h-4 w-4" />
        <span className="text-xs">{isLoggingOut ? 'Loggar ut...' : 'Logga ut'}</span>
      </Button>
    </div>
  );
}

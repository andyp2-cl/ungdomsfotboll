
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
  const onLogout = async () => {
    console.log("Logout button clicked");
    const success = await handleLogout();
    
    // If logout failed and we're still here, give another option
    if (!success) {
      setTimeout(() => {
        // Add a fallback to try reloading
        if (confirm("Utloggningen fungerade inte korrekt. Vill du ladda om sidan?")) {
          window.location.reload();
        }
      }, 3000);
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
      >
        <LogOut className="h-4 w-4" />
        <span className="text-xs">Logga ut</span>
      </Button>
    </div>
  );
}

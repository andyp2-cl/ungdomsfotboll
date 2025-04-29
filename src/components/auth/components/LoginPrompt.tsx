
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface LoginPromptProps {
  handleLogin: () => void;
  isAuthenticating: boolean;
}

export function LoginPrompt({ handleLogin, isAuthenticating }: LoginPromptProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex gap-1.5 items-center"
      onClick={handleLogin}
      disabled={isAuthenticating}
    >
      <AlertCircle className="h-4 w-4" />
      <span className="text-xs">
        {isAuthenticating ? "Aktiverar åtkomst..." : "Logga in för databasåtkomst"}
      </span>
    </Button>
  );
}

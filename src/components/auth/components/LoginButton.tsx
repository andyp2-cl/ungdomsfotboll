
import React from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

type LoginButtonProps = {
  setShowLogin: (show: boolean) => void;
};

export function LoginButton({ setShowLogin }: LoginButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="flex gap-1.5 items-center"
      onClick={() => setShowLogin(true)}
    >
      <AlertCircle className="h-4 w-4" />
      <span className="text-xs">
        Logga in för databasåtkomst
      </span>
    </Button>
  );
}

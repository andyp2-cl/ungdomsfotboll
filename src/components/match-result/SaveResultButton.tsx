
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, WifiOff } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SaveResultButtonProps {
  onClick: () => void;
  isSaving: boolean;
  isOnline: boolean;
  isAuthenticated: boolean;
}

export function SaveResultButton({
  onClick,
  isSaving,
  isOnline,
  isAuthenticated
}: SaveResultButtonProps) {
  const isMobile = useIsMobile();
  
  return (
    <Button 
      onClick={onClick} 
      disabled={isSaving}
      className={`w-full ${isMobile ? 'h-10' : ''}`}
      size={isMobile ? "sm" : "default"}
      variant={!isOnline ? "secondary" : "default"}
    >
      {!isOnline ? (
        <WifiOff className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
      ) : (
        <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
      )}
      
      {isSaving ? "Sparar..." : (
        isOnline ? "Spara resultat" : "Spara lokalt (offline)"
      )}
    </Button>
  );
}

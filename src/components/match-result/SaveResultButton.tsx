
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SaveResultButtonProps {
  onClick: () => void;
  isSaving: boolean;
  isOnline?: boolean;
  isAuthenticated?: boolean;
  className?: string;
}

export function SaveResultButton({
  onClick,
  isSaving,
  isOnline = true,
  isAuthenticated = false,
  className = ""
}: SaveResultButtonProps) {
  const isMobile = useIsMobile();
  
  const getButtonText = () => {
    if (isSaving) return "Sparar...";
    if (!isOnline) return "Spara lokalt";
    return isAuthenticated ? "Spara resultat" : "Spara lokalt";
  };
  
  return (
    <Button 
      onClick={onClick} 
      disabled={isSaving}
      className={`w-full ${isMobile ? 'h-10' : ''} ${className}`}
      size={isMobile ? "sm" : "default"}
    >
      <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
      {getButtonText()}
    </Button>
  );
}

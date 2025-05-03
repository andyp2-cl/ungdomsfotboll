
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResultActionsProps } from "./types";

export function ResultActions({ 
  onSave, 
  isSaving,
  isReadOnly = false
}: ResultActionsProps) {
  const isMobile = useIsMobile();
  
  if (isReadOnly) {
    return null;
  }

  return (
    <Button 
      onClick={onSave} 
      disabled={isSaving}
      className={`w-full ${isMobile ? 'h-10 mt-2' : 'mt-4'}`}
      size={isMobile ? "sm" : "default"}
    >
      <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
      {isSaving ? "Sparar..." : "Spara resultat"}
    </Button>
  );
}

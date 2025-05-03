
import React from "react";
import { Button } from "@/components/ui/button";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResultActionsProps {
  onSave: () => void;
  isSaving: boolean;
  hasError: boolean;
  showSuccess: boolean;
  retryCount: number;
}

export function ResultActions({ 
  onSave, 
  isSaving, 
  hasError, 
  showSuccess,
  retryCount
}: ResultActionsProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="mt-3">
      {hasError && (
        <div className="flex items-center gap-1 text-red-500 text-sm mb-2">
          <AlertCircle className="h-4 w-4" />
          <span>
            {retryCount >= 2 
              ? "Resultatet sparas lokalt och synkas senare" 
              : "Kunde inte spara ändringar. Försök igen."}
          </span>
        </div>
      )}
      
      {showSuccess && (
        <div className="flex items-center gap-1 text-green-500 text-sm mb-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>Resultat sparat framgångsrikt</span>
        </div>
      )}
      
      <Button 
        onClick={onSave} 
        disabled={isSaving}
        className={`w-full ${isMobile ? 'h-10' : ''} ${hasError ? "bg-red-500 hover:bg-red-600" : ""} ${showSuccess ? "bg-green-500 hover:bg-green-600" : ""}`}
        size={isMobile ? "sm" : "default"}
      >
        <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
        {isSaving ? "Sparar..." : "Spara resultat"}
      </Button>
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, AlertCircle } from "lucide-react";
import { extractTeamNames, isHomeMatch } from "./activity-detail/match-result/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface QuickMatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number) => Promise<void>;
  isReadOnly?: boolean;
  resultColorClass?: string;
}

export function QuickMatchResult({ 
  activity, 
  onSave, 
  isReadOnly = false,
  resultColorClass = ""
}: QuickMatchResultProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isMobile = useIsMobile();
  const { toast: hookToast } = useToast();
  
  useEffect(() => {
    // Update local state when activity props change
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    
    // Reset error state
    setHasError(false);
  }, [activity.homeScore, activity.awayScore]);
  
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Create appropriate labels
  const homeTeamLabel = isHome ? "HIF" : teamNames.homeTeam.substring(0, isMobile ? 8 : 15);
  const awayTeamLabel = !isHome ? "HIF" : teamNames.awayTeam.substring(0, isMobile ? 8 : 15);
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    setHasError(false);
    
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore 
    });
    
    try {
      // Convert string values to numbers if needed
      const processedHomeScore = homeScore !== undefined && homeScore !== null ? 
        (typeof homeScore === 'string' ? parseInt(homeScore as string, 10) : homeScore) : 
        undefined;
        
      const processedAwayScore = awayScore !== undefined && awayScore !== null ? 
        (typeof awayScore === 'string' ? parseInt(awayScore as string, 10) : awayScore) : 
        undefined;
      
      // Debug data conversion
      console.log("Processed score values:", {
        original: { homeScore, awayScore },
        processed: { processedHomeScore, processedAwayScore }
      });
      
      await onSave(processedHomeScore, processedAwayScore);
      
      console.log("Score saved successfully");
      
      // Use sonner toast correctly
      toast.success("Resultat sparat", {
        description: "Matchresultatet har sparats."
      });
      
      // Also use shadcn toast
      hookToast({
        description: "Matchresultatet har sparats."
      });
      
      // Reset error state on success
      setHasError(false);
    } catch (error) {
      console.error("Error saving match result:", error);
      setHasError(true);
      
      // Use sonner toast correctly for error
      toast.error("Kunde inte spara resultat", {
        description: "Ett fel uppstod vid sparande av resultat. Försök igen."
      });
      
      // Also use shadcn toast for error
      hookToast({
        variant: "destructive",
        description: "Kunde inte spara ändringar. Försök igen."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-4 px-1 pb-2">
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="space-y-1">
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'home' ? "font-semibold" : ""}`}>
              {homeTeamLabel}
            </div>
            {isReadOnly ? (
              <div className={`text-center text-lg font-bold ${resultColorClass}`}>
                {homeScore !== undefined ? homeScore : "-"}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={homeScore === undefined ? "" : homeScore}
                onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'home' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
              />
            )}
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-xl font-bold">-</div>
          </div>
          
          <div className="space-y-1">
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'away' ? "font-semibold" : ""}`}>
              {awayTeamLabel}
            </div>
            {isReadOnly ? (
              <div className={`text-center text-lg font-bold ${resultColorClass}`}>
                {awayScore !== undefined ? awayScore : "-"}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={awayScore === undefined ? "" : awayScore}
                onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'away' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
              />
            )}
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="space-y-2">
            {hasError && (
              <div className="flex items-center gap-1 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>Kunde inte spara ändringar. Försök igen.</span>
              </div>
            )}
            
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className={`w-full ${isMobile ? 'h-10' : ''} ${hasError ? "bg-red-500 hover:bg-red-600" : ""}`}
              size={isMobile ? "sm" : "default"}
            >
              <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
              {isSaving ? "Sparar..." : "Spara resultat"}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

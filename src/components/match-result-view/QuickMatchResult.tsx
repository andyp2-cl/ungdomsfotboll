
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ScoreDisplay } from "./ScoreDisplay";
import { ResultActions } from "./ResultActions";
import { MatchResultProps } from "./types";
import { isHomeMatch, determineMatchOutcome } from "../activity-detail/match-result/utils";

export function QuickMatchResult({ 
  activity, 
  onSave, 
  isReadOnly = false,
  resultColorClass = ""
}: MatchResultProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();
  const { toast: hookToast } = useToast();
  
  useEffect(() => {
    // Update local state when activity props change
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    
    // Reset error state
    setHasError(false);
  }, [activity.homeScore, activity.awayScore]);
  
  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: number;
    if (showSuccess) {
      timer = window.setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    setHasError(false);
    setShowSuccess(false);
    
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore,
      retryCount
    });
    
    try {
      // Convert string values to numbers if needed
      const processedHomeScore = homeScore !== undefined && homeScore !== null ? 
        (typeof homeScore === 'string' ? parseInt(homeScore as any, 10) : homeScore) : 
        undefined;
        
      const processedAwayScore = awayScore !== undefined && awayScore !== null ? 
        (typeof awayScore === 'string' ? parseInt(awayScore as any, 10) : awayScore) : 
        undefined;
      
      // Debug data conversion
      console.log("Processed values:", {
        original: { homeScore, awayScore },
        processed: { processedHomeScore, processedAwayScore }
      });
      
      // Let the backend determine the win status based on scores
      // We no longer pass manualWinStatus here
      await onSave(processedHomeScore, processedAwayScore);
      
      console.log("Score saved successfully");
      
      // Show success state
      setShowSuccess(true);
      setRetryCount(0); // Reset retry counter on success
      
      // Use sonner toast correctly
      toast.success("Resultat sparat", {
        description: "Matchresultatet har sparats."
      });
      
      // Reset error state on success
      setHasError(false);
      
      // Save to localStorage directly as an extra backup
      try {
        const backupData = {
          activityId: activity.id,
          homeScore: processedHomeScore,
          awayScore: processedAwayScore,
          timestamp: new Date().toISOString()
        };
        const savedScores = JSON.parse(localStorage.getItem('savedMatchScores') || '{}');
        savedScores[activity.id] = backupData;
        localStorage.setItem('savedMatchScores', JSON.stringify(savedScores));
        
        console.log("Match result also saved to local backup:", backupData);
      } catch (e) {
        console.error("Failed to save backup to localStorage:", e);
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      setHasError(true);
      setRetryCount(prev => prev + 1);
      
      // Create different messages based on retry count
      let errorMessage = "Kunde inte spara resultat. Försök igen.";
      let toastTitle = "Kunde inte spara resultat";
      
      if (retryCount >= 2) {
        errorMessage = "Flera försök misslyckades. Resultatet sparas lokalt och synkas senare.";
        toastTitle = "Sparas lokalt";
        
        // Save to local storage explicitly for retry failures
        try {
          const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
          pendingUpdates[activity.id] = {
            homeScore,
            awayScore,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
          console.log("Score saved to local backup storage");
        } catch (e) {
          console.error("Failed to save to local backup storage:", e);
        }
      }
      
      // Use sonner toast correctly for error
      toast.error(toastTitle, {
        description: errorMessage
      });
      
      // Also use shadcn toast for error
      hookToast({
        variant: "destructive",
        description: errorMessage
      });
    } finally {
      setIsSaving(false);
    }
  };

  const teamInfo = {
    homeTeam: activity.name?.split(' - ')?.[0] || 'Hemma',
    awayTeam: activity.name?.split(' - ')?.[1] || 'Borta',
    homeTeamLabel: isHomeMatch(activity) ? "HIF" : 
      (activity.name?.split(' - ')?.[0] || 'Hemma').substring(0, isMobile ? 8 : 15),
    awayTeamLabel: !isHomeMatch(activity) ? "HIF" : 
      (activity.name?.split(' - ')?.[1] || 'Borta').substring(0, isMobile ? 8 : 15),
    isHome: isHomeMatch(activity),
    hassleTeamSide: isHomeMatch(activity) ? 'home' : 'away' as 'home' | 'away',
    isHassleHomeName: false,
    isHassleAwayName: false
  };

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-4 px-1 pb-2">
        <ScoreDisplay 
          homeScore={homeScore}
          awayScore={awayScore}
          setHomeScore={isReadOnly ? undefined : setHomeScore}
          setAwayScore={isReadOnly ? undefined : setAwayScore}
          teamInfo={teamInfo}
          isReadOnly={isReadOnly}
          resultColorClass={resultColorClass}
          hasError={hasError}
        />
        
        {!isReadOnly && (
          <div className="space-y-4">
            <ResultActions 
              onSave={handleSave}
              isSaving={isSaving}
              hasError={hasError}
              showSuccess={showSuccess}
              retryCount={retryCount}
            />
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

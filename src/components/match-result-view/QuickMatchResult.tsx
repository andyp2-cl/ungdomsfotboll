
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ScoreDisplay } from "./ScoreDisplay";
import { ScoreInput } from "./ScoreInput";
import { ResultActions } from "./ResultActions";
import { MatchResultProps } from "./types";
import { isHomeMatch, extractTeamNames, isHassleholm } from "../activity-detail/match-result/utils";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

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
      retryCount,
      player_stats: activity.player_stats
    });
    
    try {
      // Ensure scores are numbers
      const processedHomeScore = homeScore === undefined ? undefined : 
        (typeof homeScore === 'string' ? parseInt(homeScore, 10) : homeScore);
        
      const processedAwayScore = awayScore === undefined ? undefined : 
        (typeof awayScore === 'string' ? parseInt(awayScore, 10) : awayScore);
      
      // Call the save function passed from parent
      await onSave(processedHomeScore, processedAwayScore);
      
      console.log("Match result saved successfully:", {
        homeScore: processedHomeScore,
        awayScore: processedAwayScore
      });
      
      setShowSuccess(true);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error("Error saving match result:", error);
      setHasError(true);
      
      // If still failing after multiple attempts, show detailed error
      if (retryCount > 1) {
        toast.error("Problem med att spara resultatet", {
          description: "Det verkar vara ett tekniskt problem. Försök ladda om sidan."
        });
      } else {
        toast.error("Kunde inte spara matchresultat");
        setRetryCount(prev => prev + 1);
      }
    } finally {
      setIsSaving(false);
    }
  };
  
  // Extract team names for display
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHifHome = isHassleholm(teamNames.homeTeam);
  const isHifAway = isHassleholm(teamNames.awayTeam);
  
  // Create appropriate labels
  const homeTeamLabel = isMobile ? 
    (isHifHome ? "HIF" : teamNames.homeTeam.substring(0, 8)) : 
    (isHifHome ? "Hässleholms IF" : teamNames.homeTeam);
    
  const awayTeamLabel = isMobile ? 
    (isHifAway ? "HIF" : teamNames.awayTeam.substring(0, 8)) : 
    (isHifAway ? "Hässleholms IF" : teamNames.awayTeam);

  if (isReadOnly && homeScore !== undefined && awayScore !== undefined) {
    return (
      <div className={`text-center text-lg font-bold ${resultColorClass}`}>
        {homeScore} - {awayScore}
      </div>
    );
  }

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-4 px-1 pb-2">
        <div className="grid grid-cols-3 gap-3 items-center">
          <ScoreInput
            label={homeTeamLabel}
            value={homeScore}
            onChange={setHomeScore}
            isHighlighted={isHifHome}
          />
          
          <div className="flex justify-center items-center">
            <div className="text-xl font-bold">-</div>
          </div>
          
          <ScoreInput 
            label={awayTeamLabel}
            value={awayScore}
            onChange={setAwayScore}
            isHighlighted={isHifAway}
          />
        </div>
        
        {!isReadOnly && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-full ${isMobile ? 'h-10' : ''}`}
            size={isMobile ? "sm" : "default"}
          >
            <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
            {isSaving ? "Sparar..." : "Spara resultat"}
          </Button>
        )}
        
        {showSuccess && (
          <div className="text-center text-green-600 font-medium py-1">
            Resultat sparat!
          </div>
        )}
        
        {hasError && (
          <div className="text-center text-red-600 font-medium py-1">
            Kunde inte spara resultatet. Försök igen.
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

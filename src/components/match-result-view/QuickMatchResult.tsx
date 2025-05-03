
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { useIsMobile } from "@/hooks/use-mobile";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ScoreDisplay } from "./ScoreDisplay";
import { ScoreInput } from "./ScoreInput";
import { ResultActions } from "./ResultActions";
import { MatchResultProps } from "./types";
import { isHomeMatch, extractTeamNames, isHassleholm } from "../activity-detail/match-result/utils";

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
  const isMobile = useIsMobile();

  // Update local state when activity props change
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    setHasError(false);
  }, [activity]);

  // Debug current activity
  useEffect(() => {
    console.log("QuickMatchResult rendered for activity:", {
      id: activity.id,
      name: activity.name,
      homeScore: activity.homeScore,
      awayScore: activity.awayScore,
      result: activity.result,
      isWin: activity.isWin
    });
  }, [activity]);
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    setHasError(false);
    
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore,
      player_stats: activity.player_stats
    });
    
    try {
      // Ensure scores are proper numbers
      const processedHomeScore = homeScore === undefined ? undefined : 
        (typeof homeScore === 'string' ? parseInt(homeScore, 10) : homeScore);
        
      const processedAwayScore = awayScore === undefined ? undefined : 
        (typeof awayScore === 'string' ? parseInt(awayScore, 10) : awayScore);
      
      // Call the save function passed from parent with numeric values
      // Fixed: Don't test the Promise<void> for truthiness directly
      await onSave(processedHomeScore, processedAwayScore);
      
      // Force clear caches to ensure fresh data loads
      localStorage.removeItem('cachedActivities');
      localStorage.removeItem('sb-activities-fetch-time');
      
      console.log("Match result saved:", {
        homeScore: processedHomeScore,
        awayScore: processedAwayScore
      });
      
      toast.success("Matchresultat sparat!");
    } catch (error) {
      console.error("Error saving match result:", error);
      setHasError(true);
      toast.error("Kunde inte spara matchresultat");
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

  // For read-only view with existing scores, use simplified display
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
          <ResultActions 
            onSave={handleSave} 
            isSaving={isSaving}
            isReadOnly={isReadOnly} 
          />
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


import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { ScrollArea } from "@/components/ui/scroll-area";
import { extractTeamNames, isHomeMatch } from "./activity-detail/match-result/utils";
import { ScoreInputDisplay } from "./match-result/ScoreInputDisplay";
import { SaveResultButton } from "./match-result/SaveResultButton";
import { useLocalStorage } from "./match-result/useLocalStorage";
import { useAuthenticationState } from "./match-result/useAuthenticationState";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();
  
  const { isAuthenticated } = useAuthenticationState();
  const { isOnline, saveToLocalStorage, notifyUser } = useLocalStorage(activity);
  
  // Update local state when activity props change
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
  }, [activity.homeScore, activity.awayScore]);
  
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Create appropriate labels
  const homeTeamLabel = isHome ? "HIF" : teamNames.homeTeam.substring(0, isMobile ? 8 : 15);
  const awayTeamLabel = !isHome ? "HIF" : teamNames.awayTeam.substring(0, isMobile ? 8 : 15);
  
  // Handle input changes with proper type conversion
  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHomeScore(value === "" ? undefined : Number(value));
  };

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAwayScore(value === "" ? undefined : Number(value));
  };
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    
    try {
      // Convert to proper number values or undefined
      let finalHomeScore: number | undefined = undefined;
      let finalAwayScore: number | undefined = undefined;
      
      if (homeScore !== undefined && homeScore !== null) {
        finalHomeScore = Number(homeScore);
      }
      
      if (awayScore !== undefined && awayScore !== null) {
        finalAwayScore = Number(awayScore);
      }
      
      // Calculate isWin value
      let isWin: boolean | undefined = undefined;
      if (finalHomeScore !== undefined && finalAwayScore !== undefined) {
        if (isHome) {
          // We are the home team
          if (finalHomeScore > finalAwayScore) {
            isWin = true;
          } else if (finalHomeScore < finalAwayScore) {
            isWin = false;
          }
          // if scores are equal, isWin remains undefined (for draw)
        } else {
          // We are the away team
          if (finalHomeScore < finalAwayScore) {
            isWin = true;
          } else if (finalHomeScore > finalAwayScore) {
            isWin = false;
          }
          // if scores are equal, isWin remains undefined (for draw)
        }
      }

      // Always save to localStorage first
      saveToLocalStorage(activity.id, {
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        isWin: isWin,
        result: finalHomeScore !== undefined && finalAwayScore !== undefined ? 
          `${finalHomeScore}-${finalAwayScore}` : undefined
      });
      
      // Try to save to database if we're online and authenticated
      if (isOnline && isAuthenticated) {
        try {
          await onSave(finalHomeScore, finalAwayScore);
          
          // If database save was successful, remove from pending updates
          const updatedPendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
          delete updatedPendingUpdates[activity.id];
          localStorage.setItem('pendingScoreUpdates', JSON.stringify(updatedPendingUpdates));
          
          notifyUser(isOnline, isAuthenticated);
        } catch (error) {
          console.error("Error saving to database, saved locally:", error);
          toast.info("Resultat sparat lokalt och kommer att synkas senare");
        }
      } else {
        notifyUser(isOnline, isAuthenticated);
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      toast.error("Ett fel uppstod vid sparande av resultat");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-4 px-1 pb-2">
        <ScoreInputDisplay
          homeTeamLabel={homeTeamLabel}
          awayTeamLabel={awayTeamLabel}
          homeScore={homeScore}
          awayScore={awayScore}
          handleHomeScoreChange={handleHomeScoreChange}
          handleAwayScoreChange={handleAwayScoreChange}
          isReadOnly={isReadOnly}
          isHassleholm={isHassleholm}
          resultColorClass={resultColorClass}
        />
        
        {!isReadOnly && (
          <SaveResultButton 
            onClick={handleSave} 
            isSaving={isSaving}
            isOnline={isOnline}
            isAuthenticated={isAuthenticated}
          />
        )}
      </div>
    </ScrollArea>
  );
}

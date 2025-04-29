
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { extractTeamNames, isHomeMatch } from "./activity-detail/match-result/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast as sonnerToast } from "sonner";

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
  const { toast } = useToast();
  
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
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore 
    });
    
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

      // First save locally regardless of online status
      const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
      pendingUpdates[activity.id] = {
        homeScore: finalHomeScore,
        awayScore: finalAwayScore,
        isWin: isWin,
        result: finalHomeScore !== undefined && finalAwayScore !== undefined ? 
          `${finalHomeScore}-${finalAwayScore}` : undefined,
        timestamp: new Date().toISOString()
      };
      
      // Save to localStorage immediately
      localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
      
      // Try to save to database if online
      try {
        await onSave(finalHomeScore, finalAwayScore);
        sonnerToast.success("Resultat sparat och synkroniserat med databasen");
        
        // If save was successful, remove from pending updates
        const updatedPendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
        delete updatedPendingUpdates[activity.id];
        localStorage.setItem('pendingScoreUpdates', JSON.stringify(updatedPendingUpdates));
      } catch (error) {
        console.error("Error saving to database, but saved locally:", error);
        sonnerToast.info("Resultat sparat lokalt och kommer att synkas senare");
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte spara resultat. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle input changes with proper type conversion
  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHomeScore(value === "" ? undefined : Number(value));
  };

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAwayScore(value === "" ? undefined : Number(value));
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
                onChange={handleHomeScoreChange}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'home' ? "border-blue-200" : ""}`}
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
                onChange={handleAwayScoreChange}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'away' ? "border-blue-200" : ""}`}
              />
            )}
          </div>
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
      </div>
    </ScrollArea>
  );
}

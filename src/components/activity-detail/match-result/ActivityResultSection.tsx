
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ScoreDisplay } from "./ScoreDisplay";
import { ScoreForm } from "./ScoreForm";
import { calculateWinStatus, isHomeMatch } from "./utils";

interface ActivityResultSectionProps {
  activity: Activity;
  isHistorical: boolean;
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityResultSection({ 
  activity, 
  isHistorical,
  updateActivity 
}: ActivityResultSectionProps) {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const [manualWinStatus, setManualWinStatus] = useState<boolean | undefined>(activity.isWin);
  
  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    setManualWinStatus(activity.isWin);
  }, [activity.homeScore, activity.awayScore, activity.isWin]);

  // Helper function to safely parse player_stats
  const safelyParsePlayerStats = (stats: any) => {
    if (!stats) return { goals: {}, assists: {} };
    
    if (typeof stats === 'string') {
      try {
        const parsed = JSON.parse(stats);
        // Check for double-stringified JSON
        return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
      } catch (e) {
        console.error("Error parsing player_stats:", e);
        return { goals: {}, assists: {} };
      }
    }
    
    return stats;
  };

  const saveMatchResult = async () => {
    setIsSaving(true);
    
    try {
      const resultString = homeScore !== undefined && awayScore !== undefined 
        ? `${homeScore}-${awayScore}` 
        : undefined;
      
      // Determine if this is a home match for our team
      const isHome = isHomeMatch(activity);
      
      // Determine win status - we'll respect the manually set status if available
      let isWin = manualWinStatus;
      
      // If no manual status, calculate based on scores
      if (isWin === undefined && homeScore !== undefined && awayScore !== undefined) {
        isWin = calculateWinStatus(homeScore, awayScore, isHome);
      }
      
      // Parse existing player_stats safely
      const existingPlayerStats = safelyParsePlayerStats(activity.player_stats);
      
      // Prepare updated player_stats
      const updatedPlayerStats = {
        ...existingPlayerStats,
        goals: existingPlayerStats.goals || {},
        assists: existingPlayerStats.assists || {},
        scores: {
          home: homeScore,
          away: awayScore
        },
        isWin
      };
      
      console.log("Saving match result with player_stats:", {
        before: activity.player_stats,
        after: updatedPlayerStats,
        beforeType: typeof activity.player_stats,
        afterType: typeof updatedPlayerStats
      });
      
      // First directly update the database
      const { error } = await supabase
        .from('activities')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          is_win: isWin,
          result: resultString,
          player_stats: updatedPlayerStats
        })
        .eq('id', activity.id);
        
      if (error) {
        console.error("Error saving match result to database:", error);
        throw error;
      }
      
      // Then update the local state
      const updatedActivity = {
        ...activity,
        result: resultString,
        homeScore,
        awayScore,
        isWin,
        player_stats: updatedPlayerStats
      };
      
      updateActivity(updatedActivity);
      
      toast({
        title: "Matchresultat sparat",
        description: resultString 
          ? `Resultat ${resultString} har sparats för ${activity.name}.` 
          : `Matchresultat har rensats för ${activity.name}.`,
      });
    } catch (error) {
      console.error("Failed to save match result:", error);
      toast({
        title: "Kunde inte spara matchresultat",
        description: "Ett fel uppstod när resultatet skulle sparas. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Determine if we have a valid result to display
  const hasResult = homeScore !== undefined && awayScore !== undefined;

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      {isHistorical && hasResult ? (
        <ScoreDisplay 
          activity={activity} 
          homeScore={homeScore} 
          awayScore={awayScore} 
        />
      ) : (
        <ScoreForm 
          activity={activity}
          homeScore={homeScore}
          awayScore={awayScore}
          setHomeScore={setHomeScore}
          setAwayScore={setAwayScore}
          manualWinStatus={manualWinStatus}
          setManualWinStatus={setManualWinStatus}
          onSave={saveMatchResult}
          isSaving={isSaving}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}

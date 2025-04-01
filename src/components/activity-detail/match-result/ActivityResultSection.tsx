
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
  }, [activity]);

  // Helper function to safely parse player_stats
  const safelyParsePlayerStats = (stats: any) => {
    if (!stats) return { goals: {}, assists: {} };
    
    // If already an object, ensure it has required structure
    if (typeof stats !== 'string') {
      return {
        ...stats,
        goals: stats.goals || {},
        assists: stats.assists || {}
      };
    }
    
    // Handle string-encoded JSON
    try {
      const parsed = JSON.parse(stats);
      // Check for double-stringified JSON
      if (typeof parsed === 'string') {
        try {
          const doubleDecoded = JSON.parse(parsed);
          return {
            ...doubleDecoded,
            goals: doubleDecoded.goals || {},
            assists: doubleDecoded.assists || {}
          };
        } catch (e) {
          console.error("Error parsing double-stringified JSON:", e);
          return { goals: {}, assists: {} };
        }
      }
      
      return {
        ...parsed,
        goals: parsed.goals || {},
        assists: parsed.assists || {}
      };
    } catch (e) {
      console.error("Error parsing player_stats JSON:", e);
      return { goals: {}, assists: {} };
    }
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
      
      // Parse existing player_stats safely and ensure it's not a string
      const existingPlayerStats = safelyParsePlayerStats(activity.player_stats);
      
      // Prepare updated player_stats - ensure it's a complete object
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
        before: {
          value: activity.player_stats,
          type: typeof activity.player_stats
        },
        after: {
          value: updatedPlayerStats,
          type: typeof updatedPlayerStats
        }
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
      
      // Use the update function from props
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

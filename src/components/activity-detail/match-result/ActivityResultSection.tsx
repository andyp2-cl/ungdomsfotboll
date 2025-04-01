
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
  
  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
  }, [activity.homeScore, activity.awayScore]);

  const saveMatchResult = async () => {
    setIsSaving(true);
    
    try {
      const resultString = homeScore !== undefined && awayScore !== undefined 
        ? `${homeScore}-${awayScore}` 
        : undefined;
      
      // Determine if this is a home match for our team
      const isHome = isHomeMatch(activity);
      
      // Determine win status based on scores and whether it's a home match
      const isWin = calculateWinStatus(homeScore, awayScore, isHome);
      
      // First directly update the database
      const { error } = await supabase
        .from('activities')
        .update({
          home_score: homeScore,
          away_score: awayScore,
          is_win: isWin
        })
        .eq('id', activity.id);
        
      if (error) {
        console.error("Error saving match result to database:", error);
        throw error;
      }
      
      console.log("Match result saved to database:", { homeScore, awayScore, isWin, isHome });
      
      // Then update the local state
      const updatedActivity = {
        ...activity,
        result: resultString,
        homeScore,
        awayScore,
        isWin,
        player_stats: {
          ...(activity.player_stats || { goals: {}, assists: {} }),
          scores: {
            home: homeScore,
            away: awayScore
          },
          isWin
        }
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
          onSave={saveMatchResult}
          isSaving={isSaving}
          isHistorical={isHistorical}
        />
      )}
    </div>
  );
}

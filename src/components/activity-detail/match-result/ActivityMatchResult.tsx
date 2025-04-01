
import { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ResultDisplay } from "./ResultDisplay";
import { ResultForm } from "./ResultForm";
import { isHomeMatch, calculateWinStatus } from "./utils";

interface ActivityMatchResultProps {
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
  isHistorical?: boolean;
}

export function ActivityMatchResult({ 
  activity, 
  updateActivity, 
  isHistorical = false 
}: ActivityMatchResultProps) {
  const { toast } = useToast();
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when activity changes
  useEffect(() => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
  }, [activity.homeScore, activity.awayScore]);

  const saveMatchResult = async () => {
    setIsSaving(true);
    
    try {
      // Determine win status based on scores
      const isWin = calculateWinStatus(homeScore, awayScore, isHomeMatch(activity));
      
      // First directly update the database to ensure the data is saved
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

      console.log("Match result saved to database:", { homeScore, awayScore, isWin });

      // Create an updated activity with the new scores
      const updatedActivity = {
        ...activity,
        homeScore,
        awayScore,
        result: homeScore !== undefined && awayScore !== undefined ? `${homeScore}-${awayScore}` : undefined,
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
        description: `Matchresultat har sparats för ${activity.name}.`,
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

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      {isHistorical && (homeScore !== undefined && awayScore !== undefined) ? (
        <ResultDisplay activity={activity} />
      ) : (
        <ResultForm 
          activity={activity}
          homeScore={homeScore}
          awayScore={awayScore}
          setHomeScore={setHomeScore}
          setAwayScore={setAwayScore}
          onSave={saveMatchResult}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

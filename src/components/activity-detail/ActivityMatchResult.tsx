
import { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  const isHomeMatch = () => {
    return activity.name.toLowerCase().includes('hässleholms if') && 
          !activity.name.toLowerCase().includes(' vs ') || 
          activity.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
  };

  const saveMatchResult = async () => {
    setIsSaving(true);
    
    try {
      // Determine win status based on scores
      let isWin: boolean | undefined = undefined;
      if (homeScore !== undefined && awayScore !== undefined) {
        if (homeScore === awayScore) {
          isWin = undefined; // Draw
        } else if (isHomeMatch()) {
          isWin = homeScore > awayScore;
        } else {
          isWin = awayScore > homeScore;
        }
      }
      
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
      
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div>
          <p className="mb-2 font-medium">{isHomeMatch() ? "Deras mål" : "Våra mål"}</p>
          {isHistorical ? (
            <div className="h-10 px-3 py-2 text-center text-lg border rounded-md bg-muted">
              {awayScore !== undefined ? awayScore : '-'}
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={awayScore === undefined ? '' : awayScore}
              onChange={(e) => setAwayScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
              className="text-center text-lg"
            />
          )}
        </div>
        
        <div className="flex justify-center items-center">
          <span className="text-2xl font-bold">-</span>
        </div>
        
        <div>
          <p className="mb-2 font-medium">{isHomeMatch() ? "Våra mål" : "Deras mål"}</p>
          {isHistorical ? (
            <div className="h-10 px-3 py-2 text-center text-lg border rounded-md bg-muted">
              {homeScore !== undefined ? homeScore : '-'}
            </div>
          ) : (
            <Input
              type="number"
              min={0}
              value={homeScore === undefined ? '' : homeScore}
              onChange={(e) => setHomeScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
              className="text-center text-lg"
            />
          )}
        </div>
      </div>
      
      {!isHistorical && (
        <Button 
          onClick={saveMatchResult} 
          className="w-full sm:w-auto"
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sparar..." : "Spara resultat"}
        </Button>
      )}
    </div>
  );
}


import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

  const isHomeMatch = () => {
    return activity.name.toLowerCase().includes('hässleholms if') && 
          !activity.name.toLowerCase().includes(' vs ') || 
          activity.name.toLowerCase().split(' vs ')[0].includes('hässleholms if');
  };

  const saveMatchResult = async () => {
    setIsSaving(true);
    
    try {
      const resultString = homeScore !== undefined && awayScore !== undefined 
        ? `${homeScore}-${awayScore}` 
        : undefined;
      
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
      
      // Log the activity data before and after the update
      console.log("Saving match result:", { 
        original: { result: activity.result, homeScore: activity.homeScore, awayScore: activity.awayScore, isWin: activity.isWin },
        updated: { result: updatedActivity.result, homeScore: updatedActivity.homeScore, awayScore: updatedActivity.awayScore, isWin: updatedActivity.isWin }
      });
      
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

  // Determine team labels based on match details
  const ourTeamLabel = isHomeMatch() ? "Våra mål" : "Våra mål";
  const theirTeamLabel = isHomeMatch() ? "Deras mål" : "Deras mål";
  
  // For historical matches, we'll show a more informative display
  const hasResult = homeScore !== undefined && awayScore !== undefined;
  
  // Determine the match outcome text
  const getOutcomeText = () => {
    if (!hasResult) return "Inget resultat";
    
    if (homeScore === awayScore) return "Oavgjort";
    
    if (isHomeMatch()) {
      return homeScore! > awayScore! ? "Vinst" : "Förlust";
    } else {
      return awayScore! > homeScore! ? "Vinst" : "Förlust";
    }
  };
  
  // Determine color for the outcome badge
  const getOutcomeColorClass = () => {
    if (!hasResult) return "bg-gray-100 text-gray-700";
    
    if (homeScore === awayScore) return "bg-blue-100 text-blue-700";
    
    const isWin = (isHomeMatch() && homeScore! > awayScore!) || 
                 (!isHomeMatch() && awayScore! > homeScore!);
                 
    return isWin ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      {isHistorical && hasResult ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="font-medium">Resultat:</span>
              <span className="text-lg font-bold">{homeScore}-{awayScore}</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getOutcomeColorClass()}`}>
              {getOutcomeText()}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="border rounded p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">{ourTeamLabel}</div>
              <div className="text-xl font-bold">{isHomeMatch() ? homeScore : awayScore}</div>
            </div>
            <div className="border rounded p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">{theirTeamLabel}</div>
              <div className="text-xl font-bold">{isHomeMatch() ? awayScore : homeScore}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 mb-3 items-center">
          <div className="space-y-2">
            <Label htmlFor="homeScore">
              {isHomeMatch() ? ourTeamLabel : theirTeamLabel}
            </Label>
            {isHistorical ? (
              <div className="h-10 px-3 py-2 text-center border rounded-md bg-muted">
                {activity.homeScore !== undefined ? activity.homeScore : "-"}
              </div>
            ) : (
              <Input
                id="homeScore"
                type="number"
                min="0"
                value={homeScore === undefined ? "" : homeScore}
                onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className="max-w-[120px]"
              />
            )}
          </div>
          <div className="flex justify-center items-center text-lg font-bold">
            -
          </div>
          <div className="space-y-2">
            <Label htmlFor="awayScore">
              {isHomeMatch() ? theirTeamLabel : ourTeamLabel}
            </Label>
            {isHistorical ? (
              <div className="h-10 px-3 py-2 text-center border rounded-md bg-muted">
                {activity.awayScore !== undefined ? activity.awayScore : "-"}
              </div>
            ) : (
              <Input
                id="awayScore"
                type="number"
                min="0"
                value={awayScore === undefined ? "" : awayScore}
                onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className="max-w-[120px]"
              />
            )}
          </div>
        </div>
      )}
      
      {!isHistorical && (
        <Button 
          size="sm" 
          onClick={saveMatchResult} 
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sparar..." : "Spara resultat"}
        </Button>
      )}
    </div>
  );
}

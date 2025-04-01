
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const saveMatchResult = () => {
    const resultString = homeScore !== undefined && awayScore !== undefined 
      ? `${homeScore}-${awayScore}` 
      : undefined;
    
    // Determine win status based on scores (if we're home, we win if homeScore > awayScore and vice versa)
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
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      <div className="grid grid-cols-3 gap-2 mb-3 items-center">
        <div className="space-y-2">
          <Label htmlFor="homeScore">
            {isHomeMatch() ? "Våra mål" : "Deras mål"}
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
            {isHomeMatch() ? "Deras mål" : "Våra mål"}
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
      
      {!isHistorical && (
        <Button size="sm" onClick={saveMatchResult}>
          <Save className="h-4 w-4 mr-2" />
          Spara resultat
        </Button>
      )}
    </div>
  );
}

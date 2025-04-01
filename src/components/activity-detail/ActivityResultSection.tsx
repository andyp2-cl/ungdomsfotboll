
import React, { useState } from "react";
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
  const [homeScore, setHomeScore] = useState(activity.homeScore || 0);
  const [awayScore, setAwayScore] = useState(activity.awayScore || 0);

  const isHomeMatch = () => {
    return activity.name.toLowerCase().startsWith('hässleholms if');
  };

  const saveMatchResult = () => {
    const resultString = `${homeScore}-${awayScore}`;
    
    const updatedActivity = {
      ...activity,
      result: resultString,
      homeScore: homeScore,
      awayScore: awayScore
    };
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Matchresultat sparat",
      description: `Resultat ${resultString} har sparats för ${activity.name}.`,
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
              value={homeScore}
              onChange={(e) => setHomeScore(Number(e.target.value))}
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
              value={awayScore}
              onChange={(e) => setAwayScore(Number(e.target.value))}
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

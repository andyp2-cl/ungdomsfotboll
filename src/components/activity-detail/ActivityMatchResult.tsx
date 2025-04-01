
import { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Save } from "lucide-react";

interface ActivityMatchResultProps {
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityMatchResult({ activity, updateActivity }: ActivityMatchResultProps) {
  const { toast } = useToast();
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);

  const saveMatchResult = () => {
    // Create an updated activity with the new scores
    const updatedActivity = {
      ...activity,
      homeScore,
      awayScore,
      result: homeScore !== undefined && awayScore !== undefined ? `${homeScore}-${awayScore}` : undefined,
      // Determine if it's a win for Hässleholms IF (assuming home team is Hässleholms IF)
      isWin: homeScore !== undefined && awayScore !== undefined 
        ? homeScore > awayScore 
        : activity.isWin
    };
    
    updateActivity(updatedActivity);
    
    toast({
      title: "Matchresultat sparat",
      description: `Matchresultat har sparats för ${activity.name}.`,
    });
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div>
          <p className="mb-2 font-medium">Deras mål</p>
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? '' : awayScore}
            onChange={(e) => setAwayScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center text-lg"
          />
        </div>
        
        <div className="flex justify-center items-center">
          <span className="text-2xl font-bold">-</span>
        </div>
        
        <div>
          <p className="mb-2 font-medium">Våra mål</p>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? '' : homeScore}
            onChange={(e) => setHomeScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center text-lg"
          />
        </div>
      </div>
      
      <Button onClick={saveMatchResult} className="w-full sm:w-auto">
        <Save className="h-4 w-4 mr-2" />
        Spara resultat
      </Button>
    </div>
  );
}

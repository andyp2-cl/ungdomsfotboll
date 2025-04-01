
import { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";

interface ActivityMatchResultProps {
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityMatchResult({ activity, updateActivity }: ActivityMatchResultProps) {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState(activity.homeScore || 0);
  const [awayScore, setAwayScore] = useState(activity.awayScore || 0);
  const [isWin, setIsWin] = useState(activity.isWin);

  const isHomeTeam = () => {
    return activity.type === "match" && 
           activity.name.toLowerCase().startsWith('hässleholms if');
  };

  const saveMatchResult = () => {
    const resultString = `${homeScore}-${awayScore}`;
    
    const updatedActivity = {
      ...activity,
      result: resultString,
      homeScore: homeScore,
      awayScore: awayScore,
      isWin: isWin
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
            {isHomeTeam() ? "Våra mål" : "Deras mål"}
          </Label>
          <Input
            id="homeScore"
            type="number"
            min="0"
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="max-w-[120px]"
          />
        </div>
        <div className="flex justify-center items-center text-lg font-bold">
          -
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayScore">
            {isHomeTeam() ? "Deras mål" : "Våra mål"}
          </Label>
          <Input
            id="awayScore"
            type="number"
            min="0"
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="max-w-[120px]"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className={`h-5 w-5 ${isWin ? "text-green-500" : "text-gray-300"}`} />
          <Switch 
            checked={isWin === true}
            onCheckedChange={(checked) => setIsWin(checked ? true : checked === false ? false : undefined)}
          />
          <XCircle className={`h-5 w-5 ${isWin === false ? "text-red-500" : "text-gray-300"}`} />
        </div>
        <span className="text-sm text-muted-foreground">
          {isWin === true ? "Hässleholms IF vann denna match" : 
           isWin === false ? "Hässleholms IF förlorade denna match" : 
           "Oavgjort"}
        </span>
      </div>
      
      <Button size="sm" onClick={saveMatchResult}>Spara resultat</Button>
    </div>
  );
}

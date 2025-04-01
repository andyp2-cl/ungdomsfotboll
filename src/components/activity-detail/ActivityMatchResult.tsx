
import { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ActivityMatchResultProps {
  activity: Activity;
  updateActivity: (updatedActivity: Activity) => void;
}

export function ActivityMatchResult({ activity, updateActivity }: ActivityMatchResultProps) {
  const { toast } = useToast();
  const [isWin, setIsWin] = useState(activity.isWin);

  const saveMatchResult = () => {
    const updatedActivity = {
      ...activity,
      isWin: isWin
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
      
      <div className="mb-4">
        <Label className="block mb-2">Matchresultat för Hässleholms IF</Label>
        <RadioGroup
          onValueChange={(value) => {
            if (value === "win") setIsWin(true);
            else if (value === "loss") setIsWin(false);
            else setIsWin(undefined);
          }}
          defaultValue={isWin === true ? "win" : isWin === false ? "loss" : "draw"}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="win" id="win" />
            <Label htmlFor="win" className="flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
              Vinst
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="draw" id="draw" />
            <Label htmlFor="draw">Oavgjort</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="loss" id="loss" />
            <Label htmlFor="loss" className="flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              Förlust
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button size="sm" onClick={saveMatchResult}>Spara resultat</Button>
    </div>
  );
}

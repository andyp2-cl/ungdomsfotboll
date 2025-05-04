
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface SimpleResultViewProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function SimpleResultView({ activity, onMatchResultUpdate }: SimpleResultViewProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isLoading, setIsLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | "draw" | undefined>(
    activity.isWin === true ? "win" : 
    activity.isWin === false ? "loss" : 
    activity.homeScore === activity.awayScore && activity.homeScore !== undefined ? "draw" : 
    undefined
  );
  const { toast } = useToast();
  
  // Check if the name contains "HIF" to identify team (Hässleholms IF)
  const isHifMatch = activity.name.includes("HIF") || 
                      activity.name.toLowerCase().includes("hässleholm");
  
  // Function to handle score update
  const handleScoreUpdate = async () => {
    setIsLoading(true);
    try {
      console.log("Updating match result:", {
        activityId: activity.id,
        homeScore,
        awayScore,
        matchResult
      });
      
      // Update scores in database
      const success = await onMatchResultUpdate(activity.id, homeScore, awayScore);
      
      if (success) {
        toast({
          title: "Matchresultat uppdaterat",
          description: `Resultatet är nu satt till ${homeScore}-${awayScore}`,
        });
      } else {
        toast({
          title: "Fel",
          description: "Kunde inte uppdatera matchresultat",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating match result:", error);
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid uppdatering av matchresultat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-md bg-gray-50">
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="homeScore">Hemmalag</Label>
          <Input
            id="homeScore"
            type="number"
            min="0"
            className="w-16"
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore(e.target.value ? parseInt(e.target.value) : undefined)}
          />
        </div>
        
        <span className="text-xl font-bold">-</span>
        
        <div className="flex items-center gap-2">
          <Input
            id="awayScore"
            type="number"
            min="0"
            className="w-16"
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore(e.target.value ? parseInt(e.target.value) : undefined)}
          />
          <Label htmlFor="awayScore">Bortalag</Label>
        </div>
      </div>
      
      {isHifMatch && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Hässleholms resultat:</p>
          <RadioGroup 
            value={matchResult} 
            onValueChange={(value) => setMatchResult(value as "win" | "loss" | "draw")}
            className="flex flex-row gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="win" id="win" />
              <Label htmlFor="win">Vinst</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="draw" id="draw" />
              <Label htmlFor="draw">Oavgjort</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="loss" id="loss" />
              <Label htmlFor="loss">Förlust</Label>
            </div>
          </RadioGroup>
        </div>
      )}
      
      <Button 
        onClick={handleScoreUpdate} 
        disabled={isLoading}
        className="mt-4"
      >
        {isLoading ? "Uppdaterar..." : "Spara resultat"}
      </Button>
      
      {activity.homeScore !== undefined && activity.awayScore !== undefined && (
        <p className="text-sm text-gray-600 mt-2">
          Nuvarande resultat: {activity.homeScore}-{activity.awayScore}
        </p>
      )}
    </div>
  );
}

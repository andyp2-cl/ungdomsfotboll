
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface SimpleResultViewProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
}

export function SimpleResultView({ activity, onMatchResultUpdate }: SimpleResultViewProps) {
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  
  // Helper function to parse score input
  const parseScoreInput = (value: string): number | undefined => {
    if (value === "") return undefined;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? undefined : parsed;
  };
  
  // Handle saving match result
  const handleSaveResult = async () => {
    if (isUpdating) return;
    
    setIsUpdating(true);
    
    try {
      const success = await onMatchResultUpdate(activity.id, homeScore, awayScore);
      
      if (success) {
        toast({
          title: "Resultat sparat",
          description: `Matchresultat har sparats: ${homeScore}-${awayScore}`,
        });
      } else {
        toast({
          title: "Fel vid sparande",
          description: "Det gick inte att spara matchresultatet",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        title: "Fel",
        description: "Ett fel uppstod vid sparande av matchresultat",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  const isUnsavedChanges = homeScore !== activity.homeScore || awayScore !== activity.awayScore;
  
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium">Hemmalag</span>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore(parseScoreInput(e.target.value))}
            className="w-16 text-center"
          />
        </div>
        
        <span className="text-xl font-bold">-</span>
        
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore(parseScoreInput(e.target.value))}
            className="w-16 text-center"
          />
          <span className="font-medium">Bortalag</span>
        </div>
        
        <Button 
          onClick={handleSaveResult} 
          disabled={!isUnsavedChanges || isUpdating}
          className="ml-auto"
        >
          {isUpdating ? "Sparar..." : "Spara resultat"}
        </Button>
      </div>
    </Card>
  );
}

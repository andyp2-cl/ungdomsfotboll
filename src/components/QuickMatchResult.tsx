
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { extractTeamNames, isHomeMatch } from "./activity-detail/match-result/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface QuickMatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number) => Promise<void>;
  isReadOnly?: boolean;
  resultColorClass?: string;
}

export function QuickMatchResult({ 
  activity, 
  onSave, 
  isReadOnly = false,
  resultColorClass = ""
}: QuickMatchResultProps) {
  // Use proper typing from the beginning
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Create appropriate labels
  const homeTeamLabel = isHome ? "HIF" : teamNames.homeTeam.substring(0, isMobile ? 8 : 15);
  const awayTeamLabel = !isHome ? "HIF" : teamNames.awayTeam.substring(0, isMobile ? 8 : 15);
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore 
    });
    
    try {
      // Ensure we're passing numeric values
      let processedHomeScore: number | undefined = undefined;
      let processedAwayScore: number | undefined = undefined;
      
      if (homeScore !== undefined && homeScore !== null) {
        processedHomeScore = typeof homeScore === 'string' 
          ? parseInt(homeScore as string, 10) 
          : homeScore as number;
      }
      
      if (awayScore !== undefined && awayScore !== null) {
        processedAwayScore = typeof awayScore === 'string'
          ? parseInt(awayScore as string, 10) 
          : awayScore as number;
      }
      
      // Debug data conversion
      console.log("Processed score values:", {
        original: { homeScore, awayScore },
        processed: { processedHomeScore, processedAwayScore }
      });
      
      await onSave(processedHomeScore, processedAwayScore);
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        title: "Ett fel uppstod",
        description: "Kunde inte spara resultat. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Input change handler to ensure types are correct
  const handleHomeScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHomeScore(value === "" ? undefined : Number(value));
  };

  const handleAwayScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAwayScore(value === "" ? undefined : Number(value));
  };

  return (
    <ScrollArea className={isMobile ? "max-h-[45vh]" : ""}>
      <div className="space-y-4 px-1 pb-2">
        <div className="grid grid-cols-3 gap-3 items-center">
          <div className="space-y-1">
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'home' ? "font-semibold" : ""}`}>
              {homeTeamLabel}
            </div>
            {isReadOnly ? (
              <div className={`text-center text-lg font-bold ${resultColorClass}`}>
                {homeScore !== undefined ? homeScore : "-"}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={homeScore === undefined ? "" : homeScore}
                onChange={handleHomeScoreChange}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'home' ? "border-blue-200" : ""}`}
              />
            )}
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-xl font-bold">-</div>
          </div>
          
          <div className="space-y-1">
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${isHassleholm === 'away' ? "font-semibold" : ""}`}>
              {awayTeamLabel}
            </div>
            {isReadOnly ? (
              <div className={`text-center text-lg font-bold ${resultColorClass}`}>
                {awayScore !== undefined ? awayScore : "-"}
              </div>
            ) : (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={awayScore === undefined ? "" : awayScore}
                onChange={handleAwayScoreChange}
                className={`${isMobile ? 'h-10 text-center' : ''} ${isHassleholm === 'away' ? "border-blue-200" : ""}`}
              />
            )}
          </div>
        </div>
        
        {!isReadOnly && (
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className={`w-full ${isMobile ? 'h-10' : ''}`}
            size={isMobile ? "sm" : "default"}
          >
            <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
            {isSaving ? "Sparar..." : "Spara resultat"}
          </Button>
        )}
      </div>
    </ScrollArea>
  );
}

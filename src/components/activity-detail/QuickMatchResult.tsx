
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { extractTeamNames, isHomeMatch } from "./match-result/utils";
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
      // Convert string values to numbers if needed
      const processedHomeScore = typeof homeScore === 'string' ? parseInt(homeScore, 10) : homeScore;
      const processedAwayScore = typeof awayScore === 'string' ? parseInt(awayScore, 10) : awayScore;
      
      await onSave(processedHomeScore, processedAwayScore);
      toast({
        title: "Resultat sparat",
        description: "Matchresultatet har sparats framgångsrikt.",
      });
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
                onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
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
                onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
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

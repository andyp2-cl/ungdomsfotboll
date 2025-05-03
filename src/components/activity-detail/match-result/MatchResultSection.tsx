
import { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  isHomeMatch,
  extractTeamNames,
  isHassleholm,
  getResultColorClass
} from "./utils";

interface MatchResultSectionProps {
  activity: Activity;
  onMatchResultUpdate: (activityId: string, homeScore?: number, awayScore?: number) => Promise<boolean>;
  isReadOnly?: boolean;
}

export function MatchResultSection({ activity, onMatchResultUpdate, isReadOnly = false }: MatchResultSectionProps) {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  
  // Only show for match type
  if (activity.type !== "match") {
    return null;
  }
  
  const { homeTeam, awayTeam } = extractTeamNames(activity);
  const isHifHome = isHassleholm(homeTeam);
  const isHifAway = isHassleholm(awayTeam);
  
  const resultColorClass = getResultColorClass(activity);
  
  const handleScoreChange = (value: string, field: 'home' | 'away') => {
    const numericValue = value === "" ? undefined : parseInt(value, 10);
    if (field === 'home') setHomeScore(numericValue);
    else setAwayScore(numericValue);
  };
  
  const saveResult = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    try {
      console.log(`Saving match result for ${activity.id}: ${homeScore}-${awayScore}`);
      
      // Force scores to be numeric or undefined
      const processedHomeScore = homeScore === undefined ? undefined : 
        (typeof homeScore === 'string' ? parseInt(homeScore as string, 10) : homeScore);
        
      const processedAwayScore = awayScore === undefined ? undefined : 
        (typeof awayScore === 'string' ? parseInt(awayScore as string, 10) : awayScore);
      
      const success = await onMatchResultUpdate(
        activity.id,
        processedHomeScore,
        processedAwayScore
      );
      
      if (success) {
        toast({
          title: "Matchresultat sparat",
          description: `Resultatet ${processedHomeScore}-${processedAwayScore} har sparats i databasen.`,
        });
        
        // Clear browser caches to ensure fresh data
        localStorage.removeItem('cachedActivities');
        localStorage.removeItem('sb-activities-fetch-time');
      } else {
        toast({
          variant: "destructive",
          title: "Kunde inte spara",
          description: "Resultatet kunde inte sparas i databasen. Försök igen."
        });
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      toast({
        variant: "destructive",
        title: "Fel vid sparande",
        description: "Ett oväntat fel uppstod. Försök igen senare."
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold mb-3">Matchresultat</h3>
      
      {/* Display current result if there is one */}
      {activity.homeScore !== undefined && activity.awayScore !== undefined && (
        <div className={`text-center text-xl font-bold mb-3 ${resultColorClass}`}>
          {activity.homeScore} - {activity.awayScore}
        </div>
      )}
      
      {!isReadOnly && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 items-center">
            <div className="space-y-1">
              <label className={`block font-medium text-sm ${isHifHome ? "font-semibold" : ""}`}>
                {isHifHome ? "HIF" : homeTeam}
              </label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={homeScore === undefined ? "" : homeScore}
                onChange={(e) => handleScoreChange(e.target.value, 'home')}
                min={0}
              />
            </div>
            
            <div className="flex justify-center items-center">
              <span className="text-xl font-bold">-</span>
            </div>
            
            <div className="space-y-1">
              <label className={`block font-medium text-sm ${isHifAway ? "font-semibold" : ""}`}>
                {isHifAway ? "HIF" : awayTeam}
              </label>
              <input
                type="number"
                className="w-full border rounded p-2"
                value={awayScore === undefined ? "" : awayScore}
                onChange={(e) => handleScoreChange(e.target.value, 'away')}
                min={0}
              />
            </div>
          </div>
          
          <Button 
            onClick={saveResult} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Sparar..." : "Spara resultat"}
          </Button>
          
          <p className="text-sm text-gray-500 text-center">
            Resultatet sparas direkt i databasen.
          </p>
        </div>
      )}
    </div>
  );
}

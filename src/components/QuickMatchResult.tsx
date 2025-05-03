
import React, { useState, useEffect } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { extractTeamNames, isHomeMatch, calculateWinStatus, isHassleholm } from "./activity-detail/match-result/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { CheckCircle, Circle, XCircle } from "lucide-react";

interface QuickMatchResultProps {
  activity: Activity;
  onSave: (homeScore?: number, awayScore?: number, isWin?: boolean) => Promise<void>;
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
  const [manualWinStatus, setManualWinStatus] = useState<boolean | undefined>(activity.isWin);
  const [isSaving, setIsSaving] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const isMobile = useIsMobile();
  const { toast: hookToast } = useToast();
  
  useEffect(() => {
    // Update local state when activity props change
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    setManualWinStatus(activity.isWin);
    
    // Reset error state
    setHasError(false);
  }, [activity.homeScore, activity.awayScore, activity.isWin]);
  
  // Reset success message after 3 seconds
  useEffect(() => {
    let timer: number;
    if (showSuccess) {
      timer = window.setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [showSuccess]);
  
  // Handle auto win/loss status when scores change
  useEffect(() => {
    // Only auto-calculate if both scores exist and they are different (not a draw)
    // And no manual override exists
    if (homeScore !== undefined && 
        awayScore !== undefined && 
        homeScore !== awayScore && 
        manualWinStatus === undefined) {
      
      const isHome = isHomeMatch(activity);
      const calculatedStatus = calculateWinStatus(homeScore, awayScore, isHome);
      setManualWinStatus(calculatedStatus);
      
      console.log(`Auto-calculated win status: ${calculatedStatus} based on scores ${homeScore}-${awayScore}, isHome=${isHome}`);
    }
    
    // For equal scores, set to draw (undefined) unless manually overridden
    if (homeScore !== undefined && awayScore !== undefined && homeScore === awayScore) {
      console.log("Scores are equal, setting to draw");
      setManualWinStatus(undefined); // Draw
    }
  }, [homeScore, awayScore, activity]);
  
  const teamNames = extractTeamNames(activity);
  const isHome = isHomeMatch(activity);
  
  // Determine if Hässleholms IF is the home or away team
  // Use the enhanced isHassleholm function to check team names
  const homeTeam = teamNames.homeTeam;
  const awayTeam = teamNames.awayTeam;
  const isHassleHomeName = isHassleholm(homeTeam);
  const isHassleAwayName = isHassleholm(awayTeam);
  
  // Set which side is Hässleholms IF based on team name analysis
  const hassleTeamSide = isHassleHomeName ? 'home' : isHassleAwayName ? 'away' : (isHome ? 'home' : 'away');
  
  // Create appropriate labels - highlight HIF when it's in the name
  const homeTeamLabel = isHassleHomeName ? "HIF" : homeTeam.substring(0, isMobile ? 8 : 15);
  const awayTeamLabel = isHassleAwayName ? "HIF" : awayTeam.substring(0, isMobile ? 8 : 15);
  
  // Handle radio button change
  const handleWinStatusChange = (value: string) => {
    console.log("Win status radio changed to:", value);
    
    switch (value) {
      case "win":
        setManualWinStatus(true);
        break;
      case "loss":
        setManualWinStatus(false);
        break;
      case "draw":
        setManualWinStatus(undefined);
        
        // For draw, ensure scores are equal if they exist
        if (homeScore !== undefined && awayScore !== undefined && homeScore !== awayScore) {
          // Optional: Suggest equalizing the scores
          if (window.confirm("Vill du göra målen lika för oavgjort?")) {
            // Set both to the home score value
            setHomeScore(homeScore);
            setAwayScore(homeScore);
          }
        }
        break;
    }
    
    console.log(`Changed win status to: ${value}, manualWinStatus will be: ${value === 'draw' ? 'undefined' : value === 'win'}`);
  };
  
  // Determine current radio value based on isWin
  const getWinStatusValue = () => {
    if (manualWinStatus === true) return "win";
    if (manualWinStatus === false) return "loss";
    return "draw";
  };
  
  const handleSave = async () => {
    if (isReadOnly) return;
    
    setIsSaving(true);
    setHasError(false);
    setShowSuccess(false);
    
    console.log("QuickMatchResult - Saving match result:", { 
      activityId: activity.id, 
      homeScore, 
      awayScore,
      manualWinStatus: manualWinStatus === undefined ? "undefined/draw" : manualWinStatus,
      isHome,
      teamNames,
      isHassleHomeName,
      isHassleAwayName,
      retryCount
    });
    
    try {
      // Convert string values to numbers if needed
      const processedHomeScore = homeScore !== undefined && homeScore !== null ? 
        (typeof homeScore === 'string' ? parseInt(homeScore as any, 10) : homeScore) : 
        undefined;
        
      const processedAwayScore = awayScore !== undefined && awayScore !== null ? 
        (typeof awayScore === 'string' ? parseInt(awayScore as any, 10) : awayScore) : 
        undefined;
      
      // Debug data conversion
      console.log("Processed values:", {
        original: { homeScore, awayScore, manualWinStatus },
        processed: { 
          processedHomeScore, 
          processedAwayScore, 
          manualWinStatus: manualWinStatus === undefined ? "undefined/draw" : manualWinStatus 
        }
      });
      
      // IMPORTANT: Make sure to pass manualWinStatus explicitly
      // Save the match result with our now very robust save function
      await onSave(processedHomeScore, processedAwayScore, manualWinStatus);
      
      console.log("Score saved successfully");
      
      // Show success state
      setShowSuccess(true);
      setRetryCount(0); // Reset retry counter on success
      
      // Use sonner toast correctly
      toast.success("Resultat sparat", {
        description: "Matchresultatet har sparats."
      });
      
      // Reset error state on success
      setHasError(false);
      
      // Save to localStorage directly as an extra backup
      try {
        const backupData = {
          activityId: activity.id,
          homeScore: processedHomeScore,
          awayScore: processedAwayScore,
          isWin: manualWinStatus, // Save the exact value including undefined for draws
          timestamp: new Date().toISOString()
        };
        const savedScores = JSON.parse(localStorage.getItem('savedMatchScores') || '{}');
        savedScores[activity.id] = backupData;
        localStorage.setItem('savedMatchScores', JSON.stringify(savedScores));
        
        console.log("Match result also saved to local backup:", backupData);
      } catch (e) {
        console.error("Failed to save backup to localStorage:", e);
      }
    } catch (error) {
      console.error("Error saving match result:", error);
      setHasError(true);
      setRetryCount(prev => prev + 1);
      
      // Create different messages based on retry count
      let errorMessage = "Kunde inte spara resultat. Försök igen.";
      let toastTitle = "Kunde inte spara resultat";
      
      if (retryCount >= 2) {
        errorMessage = "Flera försök misslyckades. Resultatet sparas lokalt och synkas senare.";
        toastTitle = "Sparas lokalt";
        
        // Save to local storage explicitly for retry failures
        try {
          const pendingUpdates = JSON.parse(localStorage.getItem('pendingScoreUpdates') || '{}');
          pendingUpdates[activity.id] = {
            homeScore,
            awayScore,
            isWin: manualWinStatus,
            timestamp: new Date().toISOString()
          };
          localStorage.setItem('pendingScoreUpdates', JSON.stringify(pendingUpdates));
          console.log("Score saved to local backup storage");
        } catch (e) {
          console.error("Failed to save to local backup storage:", e);
        }
      }
      
      // Use sonner toast correctly for error
      toast.error(toastTitle, {
        description: errorMessage
      });
      
      // Also use shadcn toast for error
      hookToast({
        variant: "destructive",
        description: errorMessage
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
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${hassleTeamSide === 'home' ? "font-semibold" : ""}`}>
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
                className={`${isMobile ? 'h-10 text-center' : ''} ${hassleTeamSide === 'home' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
              />
            )}
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-xl font-bold">-</div>
          </div>
          
          <div className="space-y-1">
            <div className={`font-medium text-center ${isMobile ? 'text-xs' : 'text-sm'} ${hassleTeamSide === 'away' ? "font-semibold" : ""}`}>
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
                className={`${isMobile ? 'h-10 text-center' : ''} ${hassleTeamSide === 'away' ? "border-blue-200" : ""} ${hasError ? "border-red-500" : ""}`}
              />
            )}
          </div>
        </div>
        
        {!isReadOnly && (
          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Resultat:</div>
              <RadioGroup 
                value={getWinStatusValue()} 
                onValueChange={handleWinStatusChange}
                className="flex flex-row gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="win" id="win" />
                  <Label htmlFor="win" className="flex items-center cursor-pointer">
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    <span>Vinst</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draw" id="draw" />
                  <Label htmlFor="draw" className="flex items-center cursor-pointer">
                    <Circle className="h-4 w-4 mr-1 text-gray-600" />
                    <span>Oavgjort</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="loss" id="loss" />
                  <Label htmlFor="loss" className="flex items-center cursor-pointer">
                    <XCircle className="h-4 w-4 mr-1 text-red-600" />
                    <span>Förlust</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="mt-3">
              {hasError && (
                <div className="flex items-center gap-1 text-red-500 text-sm mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>
                    {retryCount >= 2 
                      ? "Resultatet sparas lokalt och synkas senare" 
                      : "Kunde inte spara ändringar. Försök igen."}
                  </span>
                </div>
              )}
              
              {showSuccess && (
                <div className="flex items-center gap-1 text-green-500 text-sm mb-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Resultat sparat framgångsrikt</span>
                </div>
              )}
              
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className={`w-full ${isMobile ? 'h-10' : ''} ${hasError ? "bg-red-500 hover:bg-red-600" : ""} ${showSuccess ? "bg-green-500 hover:bg-green-600" : ""}`}
                size={isMobile ? "sm" : "default"}
              >
                <Save className={`${isMobile ? 'h-3.5 w-3.5 mr-1.5' : 'h-4 w-4 mr-2'}`} />
                {isSaving ? "Sparar..." : "Spara resultat"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

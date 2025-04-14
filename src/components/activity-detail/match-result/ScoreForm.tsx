
import React from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { isHomeMatch, extractTeamNames } from "./utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreFormProps {
  activity: Activity;
  homeScore: number | undefined;
  awayScore: number | undefined;
  setHomeScore: (score: number | undefined) => void;
  setAwayScore: (score: number | undefined) => void;
  manualWinStatus?: boolean | undefined;
  setManualWinStatus?: (status: boolean | undefined) => void;
  onSave: () => void;
  isSaving: boolean;
  isHistorical?: boolean;
}

export function ScoreForm({
  activity,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  manualWinStatus,
  setManualWinStatus,
  onSave,
  isSaving,
  isHistorical = false
}: ScoreFormProps) {
  const isHome = isHomeMatch(activity);
  const teamNames = extractTeamNames(activity);
  const isMobile = useIsMobile();
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Create appropriate labels for the score inputs
  const homeTeamLabel = isHome ? "Hässleholms IF (hemma)" : teamNames.homeTeam;
  const awayTeamLabel = !isHome ? "Hässleholms IF (borta)" : teamNames.awayTeam;

  // Handle win status change with improved logic for draw
  const handleWinStatusChange = (value: string) => {
    if (!setManualWinStatus) return;
    
    console.log("ScoreForm handleWinStatusChange:", value);
    
    switch (value) {
      case "win":
        setManualWinStatus(true);
        break;
      case "loss":
        setManualWinStatus(false);
        break;
      case "draw":
        // Set to undefined for draw - this is critical
        setManualWinStatus(undefined);
        
        // Optionally, if scores are not equal, make them equal
        if (homeScore !== undefined && awayScore !== undefined && homeScore !== awayScore) {
          if (window.confirm("Vill du göra målen lika för oavgjort?")) {
            setHomeScore(homeScore);
            setAwayScore(homeScore);
          }
        } else if (homeScore !== undefined && awayScore === undefined) {
          setAwayScore(homeScore);
        } else if (homeScore === undefined && awayScore !== undefined) {
          setHomeScore(awayScore);
        }
        break;
    }
    
    console.log(`Changed win status to: ${value}, manualWinStatus will be: ${value === 'draw' ? 'undefined' : value === 'win'}`);
  };

  // Determine current value for the radio group
  let winStatusValue = "draw"; // Default to draw
  
  if (manualWinStatus === true) {
    winStatusValue = "win";
  } else if (manualWinStatus === false) {
    winStatusValue = "loss";
  }
  // If undefined, it stays as "draw"
  
  // Log the current state for debugging
  console.log("ScoreForm render state:", { 
    manualWinStatus, 
    winStatusValue,
    homeScore, 
    awayScore 
  });

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3">Resultat</h4>
          <div className="grid grid-cols-3 gap-3 items-center">
            <div className="space-y-2">
              <Label htmlFor="homeScore" className={`${isHassleholm === 'home' ? "font-semibold" : ""} ${isMobile ? "text-sm" : ""}`}>
                {isMobile ? (isHome ? "HIF" : teamNames.homeTeam.substring(0, 8)) : homeTeamLabel}
              </Label>
              <Input
                id="homeScore"
                type="number"
                min="0"
                inputMode="numeric"
                value={homeScore === undefined ? "" : homeScore}
                onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className={`${isHassleholm === 'home' ? "border-blue-200" : ""} ${isMobile ? "h-12 text-lg" : ""}`}
              />
            </div>
            <div className="flex justify-center items-center text-lg font-bold">
              -
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayScore" className={`${isHassleholm === 'away' ? "font-semibold" : ""} ${isMobile ? "text-sm" : ""}`}>
                {isMobile ? (!isHome ? "HIF" : teamNames.awayTeam.substring(0, 8)) : awayTeamLabel}
              </Label>
              <Input
                id="awayScore"
                type="number"
                min="0"
                inputMode="numeric"
                value={awayScore === undefined ? "" : awayScore}
                onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
                className={`${isHassleholm === 'away' ? "border-blue-200" : ""} ${isMobile ? "h-12 text-lg" : ""}`}
              />
            </div>
          </div>
        </div>
        
        {setManualWinStatus && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">Matchresultat</h4>
            <RadioGroup 
              value={winStatusValue} 
              onValueChange={handleWinStatusChange}
              className={`flex ${isMobile ? 'flex-col space-y-2' : 'space-x-4'}`}
            >
              <div className={`flex items-center ${isMobile ? 'px-3 py-2 border rounded-md w-full' : 'space-x-2'}`}>
                <RadioGroupItem value="win" id="win" className={isMobile ? "mr-2" : ""} />
                <Label htmlFor="win" className="flex items-center cursor-pointer">
                  <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                  Vinst
                </Label>
              </div>
              <div className={`flex items-center ${isMobile ? 'px-3 py-2 border rounded-md w-full' : 'space-x-2'}`}>
                <RadioGroupItem value="draw" id="draw" className={isMobile ? "mr-2" : ""} />
                <Label htmlFor="draw" className="flex items-center cursor-pointer">
                  <MinusCircle className="h-4 w-4 mr-1 text-gray-600" />
                  Oavgjort
                </Label>
              </div>
              <div className={`flex items-center ${isMobile ? 'px-3 py-2 border rounded-md w-full' : 'space-x-2'}`}>
                <RadioGroupItem value="loss" id="loss" className={isMobile ? "mr-2" : ""} />
                <Label htmlFor="loss" className="flex items-center cursor-pointer">
                  <XCircle className="h-4 w-4 mr-1 text-red-600" />
                  Förlust
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className={isMobile ? "w-full h-12 mt-2" : "w-full"}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sparar..." : "Spara resultat"}
        </Button>
      </div>
    </div>
  );
}

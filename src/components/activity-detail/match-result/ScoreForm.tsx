
import React from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { isHomeMatch, extractTeamNames } from "./utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScoreFormProps {
  activity: Activity;
  homeScore: number | undefined;
  awayScore: number | undefined;
  setHomeScore: (score: number | undefined) => void;
  setAwayScore: (score: number | undefined) => void;
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

  return (
    <div className="pb-6">
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
                className={`${isHassleholm === 'home' ? "border-blue-200" : ""} ${isMobile ? "h-12 text-lg text-center" : ""}`}
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
                className={`${isHassleholm === 'away' ? "border-blue-200" : ""} ${isMobile ? "h-12 text-lg text-center" : ""}`}
              />
            </div>
          </div>
        </div>
        
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

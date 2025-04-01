
import React from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { isHomeMatch, extractTeamNames } from "./utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormLabel } from "@/components/ui/form";
import { CheckCircle2, XCircle } from "lucide-react";

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
  
  // Determine if Hässleholms IF is the home or away team
  const isHassleholm = isHome ? 'home' : 'away';
  
  // Create appropriate labels for the score inputs
  const homeTeamLabel = isHome ? "Hässleholms IF (hemma)" : teamNames.homeTeam;
  const awayTeamLabel = !isHome ? "Hässleholms IF (borta)" : teamNames.awayTeam;

  return (
    <div>
      <div className="grid grid-cols-1 gap-4">
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-2">Matchresultat</h4>
          <div className="grid grid-cols-3 gap-2 items-center">
            <div className="space-y-2">
              <Label htmlFor="homeScore" className={isHassleholm === 'home' ? "font-semibold" : ""}>
                {homeTeamLabel}
              </Label>
              {isHistorical ? (
                <div className="h-10 px-3 py-2 text-center border rounded-md bg-muted">
                  {activity.homeScore !== undefined ? activity.homeScore : "-"}
                </div>
              ) : (
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={homeScore === undefined ? "" : homeScore}
                  onChange={(e) => setHomeScore(e.target.value === "" ? undefined : Number(e.target.value))}
                  className={isHassleholm === 'home' ? "border-blue-200" : ""}
                />
              )}
            </div>
            <div className="flex justify-center items-center text-lg font-bold">
              -
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayScore" className={isHassleholm === 'away' ? "font-semibold" : ""}>
                {awayTeamLabel}
              </Label>
              {isHistorical ? (
                <div className="h-10 px-3 py-2 text-center border rounded-md bg-muted">
                  {activity.awayScore !== undefined ? activity.awayScore : "-"}
                </div>
              ) : (
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={awayScore === undefined ? "" : awayScore}
                  onChange={(e) => setAwayScore(e.target.value === "" ? undefined : Number(e.target.value))}
                  className={isHassleholm === 'away' ? "border-blue-200" : ""}
                />
              )}
            </div>
          </div>
        </div>
        
        {!isHistorical && homeScore !== undefined && awayScore !== undefined && (
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Resultat för Hässleholms IF</h4>
            <RadioGroup 
              defaultValue={
                homeScore === awayScore 
                  ? "draw" 
                  : ((isHome && homeScore > awayScore) || (!isHome && awayScore > homeScore)) 
                    ? "win" 
                    : "loss"
              }
              className="flex flex-col space-y-1"
              onValueChange={(value) => {
                // Här kan vi eventuellt justera poängen automatiskt om så önskas
                // Men vi låter det vara manuellt för nu
              }}
            >
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="win" id="win" />
                <FormLabel htmlFor="win" className="font-normal flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                  Vinst för Hässleholms IF
                </FormLabel>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="draw" id="draw" />
                <FormLabel htmlFor="draw" className="font-normal">
                  Oavgjort
                </FormLabel>
              </div>
              <div className="flex items-center space-x-3 space-y-0">
                <RadioGroupItem value="loss" id="loss" />
                <FormLabel htmlFor="loss" className="font-normal flex items-center">
                  <XCircle className="h-4 w-4 mr-2 text-red-500" />
                  Förlust för Hässleholms IF
                </FormLabel>
              </div>
            </RadioGroup>
          </div>
        )}
      </div>
      
      {!isHistorical && (
        <Button 
          size="sm" 
          onClick={onSave} 
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Sparar..." : "Spara resultat"}
        </Button>
      )}
    </div>
  );
}


import React from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { isHomeMatch } from "./utils";

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
  
  // Determine team labels based on match details
  const ourTeamLabel = "Våra mål";
  const theirTeamLabel = "Deras mål";

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 mb-3 items-center">
        <div className="space-y-2">
          <Label htmlFor="homeScore">
            {isHome ? ourTeamLabel : theirTeamLabel}
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
              className="max-w-[120px]"
            />
          )}
        </div>
        <div className="flex justify-center items-center text-lg font-bold">
          -
        </div>
        <div className="space-y-2">
          <Label htmlFor="awayScore">
            {isHome ? theirTeamLabel : ourTeamLabel}
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
              className="max-w-[120px]"
            />
          )}
        </div>
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

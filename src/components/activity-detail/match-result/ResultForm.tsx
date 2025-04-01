
import React from "react";
import { Activity } from "@/types/player";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { isHomeMatch } from "./utils";

interface ResultFormProps {
  activity: Activity;
  homeScore: number | undefined;
  awayScore: number | undefined;
  setHomeScore: (score: number | undefined) => void;
  setAwayScore: (score: number | undefined) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function ResultForm({
  activity,
  homeScore,
  awayScore,
  setHomeScore,
  setAwayScore,
  onSave,
  isSaving
}: ResultFormProps) {
  const isHome = isHomeMatch(activity);
  
  // Determine team labels
  const ourTeamLabel = "Våra mål";
  const theirTeamLabel = "Deras mål";

  return (
    <div>
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div>
          <p className="mb-2 font-medium">{isHome ? theirTeamLabel : ourTeamLabel}</p>
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? '' : awayScore}
            onChange={(e) => setAwayScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center text-lg"
          />
        </div>
        
        <div className="flex justify-center items-center">
          <span className="text-2xl font-bold">-</span>
        </div>
        
        <div>
          <p className="mb-2 font-medium">{isHome ? ourTeamLabel : theirTeamLabel}</p>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? '' : homeScore}
            onChange={(e) => setHomeScore(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center text-lg"
          />
        </div>
      </div>
      
      <Button 
        onClick={onSave}
        className="w-full sm:w-auto"
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Sparar..." : "Spara resultat"}
      </Button>
    </div>
  );
}

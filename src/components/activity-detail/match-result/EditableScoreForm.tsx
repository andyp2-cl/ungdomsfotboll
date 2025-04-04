
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditableScoreFormProps {
  homeTeamLabel: string;
  awayTeamLabel: string;
  homeScore: number | undefined;
  awayScore: number | undefined;
  onHomeScoreChange: (value: number | undefined) => void;
  onAwayScoreChange: (value: number | undefined) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function EditableScoreForm({
  homeTeamLabel,
  awayTeamLabel,
  homeScore,
  awayScore,
  onHomeScoreChange,
  onAwayScoreChange,
  onSave,
  isSaving
}: EditableScoreFormProps) {
  const isMobile = useIsMobile();
  
  // Shorten labels for mobile
  const getShortLabel = (label: string) => {
    if (!isMobile) return label;
    
    if (label.includes("Hässleholms")) {
      return "HIF";
    }
    if (label.includes("Motståndare")) {
      return "Motst.";
    }
    return label.length > 10 ? label.substring(0, 10) + "..." : label;
  };

  return (
    <div className="border rounded-md p-4 mt-4">
      <h3 className="text-base font-medium mb-3">Uppdatera matchresultat</h3>
      
      <div className="grid grid-cols-3 gap-4 items-center mb-4">
        <div className="text-center">
          <label className="block text-sm font-medium mb-1">{getShortLabel(homeTeamLabel)}</label>
          <Input
            type="number"
            min={0}
            value={homeScore === undefined ? '' : homeScore}
            onChange={(e) => onHomeScoreChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center"
          />
        </div>
        
        <div className="flex justify-center items-center">
          <span className="text-xl font-bold">-</span>
        </div>
        
        <div className="text-center">
          <label className="block text-sm font-medium mb-1">{getShortLabel(awayTeamLabel)}</label>
          <Input
            type="number"
            min={0}
            value={awayScore === undefined ? '' : awayScore}
            onChange={(e) => onAwayScoreChange(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="text-center"
          />
        </div>
      </div>
      
      <Button 
        onClick={onSave}
        className="w-full"
        disabled={isSaving}
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Sparar..." : "Spara resultat"}
      </Button>
    </div>
  );
}

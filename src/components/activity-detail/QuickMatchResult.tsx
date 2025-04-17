
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save, X, Edit2 } from "lucide-react";
import { isHomeMatch } from "./match-result/utils";
import { extractTeamNames } from "./match-result/utils";

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
  const [isEditing, setIsEditing] = useState(false);
  const [homeScore, setHomeScore] = useState<number | undefined>(activity.homeScore);
  const [awayScore, setAwayScore] = useState<number | undefined>(activity.awayScore);
  const [isSaving, setIsSaving] = useState(false);
  
  const isHome = isHomeMatch(activity);
  const teamNames = extractTeamNames(activity);
  
  // Reset scores to activity values if editing is cancelled
  const handleCancel = () => {
    setHomeScore(activity.homeScore);
    setAwayScore(activity.awayScore);
    setIsEditing(false);
  };
  
  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSave(homeScore, awayScore);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Display read-only result if not editing
  if (!isEditing) {
    const hasResult = activity.homeScore !== undefined && activity.awayScore !== undefined;
    
    return (
      <div className="flex items-center justify-between">
        <div>
          {hasResult ? (
            <div className={`font-medium ${resultColorClass}`}>
              Resultat: {activity.homeScore}-{activity.awayScore}
            </div>
          ) : (
            <div className="text-muted-foreground">Inget resultat registrerat</div>
          )}
        </div>
        
        {!isReadOnly && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsEditing(true)}
            className="h-8"
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            {hasResult ? "Ändra" : "Lägg till"}
          </Button>
        )}
      </div>
    );
  }
  
  // Display editable form
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            {isHome ? "Hässleholms IF" : teamNames.homeTeam}
          </div>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={homeScore === undefined ? "" : homeScore}
            onChange={(e) => setHomeScore(e.target.value === "" ? undefined : parseInt(e.target.value))}
          />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            {!isHome ? "Hässleholms IF" : teamNames.awayTeam}
          </div>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={awayScore === undefined ? "" : awayScore}
            onChange={(e) => setAwayScore(e.target.value === "" ? undefined : parseInt(e.target.value))}
          />
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-1" />
          Avbryt
        </Button>
        <Button 
          size="sm" 
          onClick={handleSaveClick}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Sparar..." : "Spara"}
        </Button>
      </div>
    </div>
  );
}

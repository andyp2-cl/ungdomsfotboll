
import React from "react";
import { Player } from "@/types/player";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Square, Users, Filter } from "lucide-react";

interface PlayerSelectionControlsProps {
  players: Player[];
  selectedPlayers: string[];
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onTogglePlayer: (playerId: string) => void;
}

export function PlayerSelectionControls({
  players,
  selectedPlayers,
  onSelectAll,
  onDeselectAll,
  onTogglePlayer
}: PlayerSelectionControlsProps) {
  const selectedCount = selectedPlayers.length;
  const totalCount = players.length;
  const isAllSelected = selectedCount === totalCount && totalCount > 0;
  const isNoneSelected = selectedCount === 0;

  // Group players by grade for easier selection
  const playersByGrade = players.reduce((acc, player) => {
    const grade = player.grade || 'Okänd';
    if (!acc[grade]) {
      acc[grade] = [];
    }
    acc[grade].push(player);
    return acc;
  }, {} as Record<string, Player[]>);

  const handleGradeToggle = (grade: string) => {
    const gradePlayers = playersByGrade[grade] || [];
    const gradePlayerIds = gradePlayers.map(p => p.id);
    const allGradeSelected = gradePlayerIds.every(id => selectedPlayers.includes(id));
    
    if (allGradeSelected) {
      // Deselect all players in this grade
      gradePlayerIds.forEach(id => {
        if (selectedPlayers.includes(id)) {
          onTogglePlayer(id);
        }
      });
    } else {
      // Select all players in this grade
      gradePlayerIds.forEach(id => {
        if (!selectedPlayers.includes(id)) {
          onTogglePlayer(id);
        }
      });
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span className="font-medium">Spelarval för heatmap</span>
          <Badge variant="secondary">
            {selectedCount} av {totalCount} valda
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={isAllSelected}
            className="flex items-center gap-1"
          >
            <CheckSquare className="h-4 w-4" />
            Välj alla
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            disabled={isNoneSelected}
            className="flex items-center gap-1"
          >
            <Square className="h-4 w-4" />
            Avmarkera alla
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Filter className="h-4 w-4" />
          <span>Snabbval per betyg:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(playersByGrade).map(([grade, gradePlayers]) => {
            const gradePlayerIds = gradePlayers.map(p => p.id);
            const selectedInGrade = gradePlayerIds.filter(id => selectedPlayers.includes(id)).length;
            const allGradeSelected = selectedInGrade === gradePlayerIds.length;
            
            return (
              <Button
                key={grade}
                variant={allGradeSelected ? "default" : "outline"}
                size="sm"
                onClick={() => handleGradeToggle(grade)}
                className="flex items-center gap-1"
              >
                <span>Betyg {grade}</span>
                <Badge variant="secondary" className="ml-1">
                  {selectedInGrade}/{gradePlayerIds.length}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      {selectedCount > 0 && selectedCount < 20 && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Valda spelare:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {selectedPlayers.map(playerId => {
              const player = players.find(p => p.id === playerId);
              return player ? (
                <Badge
                  key={playerId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive/20"
                  onClick={() => onTogglePlayer(playerId)}
                >
                  {player.name.split(' ')[0]} ×
                </Badge>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}

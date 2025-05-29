
import { Button } from "@/components/ui/button";
import { PlayerGrade, PlayerPosition } from "@/types/player";
import { Funnel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface PlayerFilterProps {
  selectedGrades: PlayerGrade[];
  onGradeChange: (grade: PlayerGrade) => void;
  selectedPositions?: PlayerPosition[];
  onPositionChange?: (position: PlayerPosition) => void;
  activeFiltersCount?: number;
}

export function PlayerFilter({ 
  selectedGrades, 
  onGradeChange, 
  selectedPositions = [], 
  onPositionChange,
  activeFiltersCount = 0
}: PlayerFilterProps) {
  const grades: PlayerGrade[] = ['A', 'B', 'C', 'D'];
  const positions: PlayerPosition[] = ['MV', 'BACK', 'MF', 'ANF', 'TRÄNARE'];
  const [open, setOpen] = useState(false);
  
  // Position label mapping for display with international abbreviations
  const positionLabels: Record<PlayerPosition, string> = {
    'MV': 'GK',
    'BACK': 'DEF',
    'MF': 'MID',
    'ANF': 'FW',
    'TRÄNARE': 'Tränare'
  };

  return (
    <div className="space-y-4">
      {/* Grade Filters */}
      <div className="flex items-center mb-4 flex-wrap gap-2">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="self-center text-sm font-medium mr-2">Filtrera nivå:</span>
          {grades.map((grade) => (
            <Button
              key={grade}
              size="sm"
              variant={selectedGrades.includes(grade) ? "default" : "outline"}
              onClick={() => onGradeChange(grade)}
              className={selectedGrades.includes(grade) 
                ? grade === 'A' 
                  ? 'bg-green-500 hover:bg-green-600' 
                  : grade === 'B' 
                    ? 'bg-blue-500 hover:bg-blue-600' 
                    : grade === 'C'
                      ? 'bg-orange-500 hover:bg-orange-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                : ''}
            >
              {grade}
            </Button>
          ))}
          {selectedGrades.length > 0 && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => grades.forEach(g => !selectedGrades.includes(g) && onGradeChange(g))}
            >
              Visa alla
            </Button>
          )}
        </div>
        
        <div className="ml-auto">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Funnel className="h-4 w-4" />
                Fler filter
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-1 rounded-full px-1 py-0">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4">
              <div className="space-y-4">
                <h4 className="font-medium">Avancerade filter</h4>
                <p className="text-sm text-muted-foreground">Fler filtreringsalternativ kommer här i framtiden.</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Position Filters */}
      {onPositionChange && (
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="self-center text-sm font-medium mr-2">Filtrera position:</span>
            {positions.map((position) => (
              <Button
                key={position}
                size="sm"
                variant={selectedPositions.includes(position) ? "default" : "outline"}
                onClick={() => onPositionChange(position)}
                className={selectedPositions.includes(position) 
                  ? 'bg-black hover:bg-gray-800 text-white' 
                  : ''}
              >
                {positionLabels[position]}
              </Button>
            ))}
            {selectedPositions.length > 0 && (
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => {
                  positions.forEach(p => {
                    if (selectedPositions.includes(p)) {
                      onPositionChange(p);
                    }
                  });
                }}
              >
                Visa alla
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

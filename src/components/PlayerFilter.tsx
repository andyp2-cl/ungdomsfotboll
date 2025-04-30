
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
  // Remove TRÄNARE from the positions list in the filter dropdown
  const positions: PlayerPosition[] = ['MV', 'BACK', 'MF', 'ANF'];
  const [open, setOpen] = useState(false);
  
  // Position label mapping for display
  const positionLabels: Record<PlayerPosition, string> = {
    'MV': 'Målvakt',
    'BACK': 'Back',
    'MF': 'Mittfält',
    'ANF': 'Anfall',
    'TRÄNARE': 'Tränare'
  };

  return (
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
      
      {onPositionChange && (
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
                <h4 className="font-medium">Position</h4>
                <div className="space-y-2">
                  {positions.map((position) => (
                    <div key={position} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`position-${position}`} 
                        checked={selectedPositions.includes(position)}
                        onCheckedChange={() => onPositionChange(position)} 
                      />
                      <Label htmlFor={`position-${position}`}>{positionLabels[position]}</Label>
                    </div>
                  ))}
                </div>
                {selectedPositions.length > 0 && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      positions.forEach(p => {
                        if (selectedPositions.includes(p)) {
                          onPositionChange(p);
                        }
                      });
                      setOpen(false);
                    }}
                  >
                    Rensa positionsfilter
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}

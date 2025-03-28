
import { Button } from "@/components/ui/button";
import { PlayerGrade } from "@/types/player";

interface PlayerFilterProps {
  selectedGrades: PlayerGrade[];
  onGradeChange: (grade: PlayerGrade) => void;
}

export function PlayerFilter({ selectedGrades, onGradeChange }: PlayerFilterProps) {
  const grades: PlayerGrade[] = ['A', 'B', 'C'];
  
  return (
    <div className="flex space-x-2 mb-4">
      <span className="self-center text-sm font-medium mr-2">Filtrera betyg:</span>
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
                : 'bg-orange-500 hover:bg-orange-600'
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
  );
}

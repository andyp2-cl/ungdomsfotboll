import { Button } from "@/components/ui/button";
import { PlayerGrade } from "@/types/player";

interface PlayerFilterProps {
  selectedGrades: PlayerGrade[];
  onGradeChange: (grade: PlayerGrade) => void;
  children?: React.ReactNode;
}

export function PlayerFilter({ 
  selectedGrades, 
  onGradeChange,
  children
}: PlayerFilterProps) {
  const grades: PlayerGrade[] = ['A', 'B', 'C', 'D'];

  return (
    <div className="flex items-center flex-wrap gap-2">
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
      {children}
    </div>
  );
}

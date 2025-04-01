
import { Button } from "@/components/ui/button";

interface ActivityFilterProps {
  selectedTypes: string[];
  onTypeChange: (type: string) => void;
}

export function ActivityFilter({ selectedTypes, onTypeChange }: ActivityFilterProps) {
  const types: { value: string; label: string }[] = [
    { value: 'match', label: 'Match' },
    { value: 'cup', label: 'Cup' },
  ];
  
  return (
    <div className="flex flex-wrap gap-2">
      <span className="self-center text-sm font-medium mr-1">Aktivitetstyp:</span>
      <div className="flex flex-wrap gap-2">
        {types.map((type) => (
          <Button
            key={type.value}
            size="sm"
            variant={selectedTypes.includes(type.value) ? "default" : "outline"}
            onClick={() => onTypeChange(type.value)}
          >
            {type.label}
          </Button>
        ))}
        {selectedTypes.length > 0 && selectedTypes.length < types.length && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => types.forEach(t => !selectedTypes.includes(t.value) && onTypeChange(t.value))}
          >
            Visa alla
          </Button>
        )}
      </div>
    </div>
  );
}

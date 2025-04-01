
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FORMATIONS } from './formationData';

interface FormationSelectorProps {
  selectedFormation: string;
  onFormationChange: (formation: string) => void;
}

export function FormationSelector({ selectedFormation, onFormationChange }: FormationSelectorProps) {
  return (
    <div className="mb-4">
      <Select value={selectedFormation} onValueChange={onFormationChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Välj formation" />
        </SelectTrigger>
        <SelectContent>
          {Object.keys(FORMATIONS).map((formation) => (
            <SelectItem key={formation} value={formation}>
              {formation}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

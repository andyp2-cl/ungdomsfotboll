
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type SortField = 'name' | 'grade' | 'activities' | 'winrate' | 'goalsPerMatch' | 'form';

interface SortIconProps {
  field: SortField;
  sortField: SortField;
  sortDirection: 'asc' | 'desc';
}

export function SortIcon({ field, sortField, sortDirection }: SortIconProps) {
  if (sortField !== field) {
    return <ChevronUp className="ml-1 h-4 w-4 opacity-30" />;
  }

  return sortDirection === 'asc' 
    ? <ChevronUp className="ml-1 h-4 w-4" />
    : <ChevronDown className="ml-1 h-4 w-4" />;
}

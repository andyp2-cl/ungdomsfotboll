
import { useState } from "react";
import { Player } from "@/types/player";

// Make sure to modify the SortField type to include 'activities'
export type SortField = 'name' | 'position' | 'grade' | 'activities';

export function usePlayerSorting() {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      // First check if either is a coach - coaches always at the end
      const aIsCoach = a.positions?.includes('TRÄNARE') || false;
      const bIsCoach = b.positions?.includes('TRÄNARE') || false;
      
      // If only one is a coach, that one goes last
      if (aIsCoach && !bIsCoach) return 1;
      if (!aIsCoach && bIsCoach) return -1;
      
      // If both or neither are coaches, proceed with regular sorting
      const dirMod = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * dirMod;
        case 'position':
          const posA = a.positions?.[0] || '';
          const posB = b.positions?.[0] || '';
          return posA.localeCompare(posB) * dirMod;
        case 'grade':
          // Sort coaches last within grade sort as well
          if (aIsCoach && bIsCoach) return a.name.localeCompare(b.name) * dirMod;
          return a.grade.localeCompare(b.grade) * dirMod;
        case 'activities':
          const actCountA = a.activities?.length || 0;
          const actCountB = b.activities?.length || 0;
          return (actCountA - actCountB) * dirMod;
        default:
          return 0;
      }
    });
  };

  return { sortField, sortDirection, toggleSort, sortPlayers };
}

import { ArrowDown, ArrowUp } from "lucide-react";

export function SortIcon({ field, sortField, sortDirection }: { 
  field: SortField; 
  sortField: SortField; 
  sortDirection: 'asc' | 'desc';
}) {
  if (field === sortField) {
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 inline-block ml-1" /> : <ArrowDown className="h-4 w-4 inline-block ml-1" />;
  }
  return null;
}

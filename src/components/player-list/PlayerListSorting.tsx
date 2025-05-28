
import { useState } from "react";
import { Player, Activity } from "@/types/player";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

// Update the SortField type to include 'winRatio'
export type SortField = 'name' | 'position' | 'grade' | 'activities' | 'winRatio';

export function usePlayerSorting(activities: Activity[] = []) {
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
      const dirMod = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * dirMod;
        case 'position':
          const posA = a.positions?.[0] || '';
          const posB = b.positions?.[0] || '';
          return posA.localeCompare(posB) * dirMod;
        case 'grade':
          const gradeA = a.grade || '';
          const gradeB = b.grade || '';
          return gradeA.localeCompare(gradeB) * dirMod;
        case 'activities':
          const activitiesA = a.activities?.length || 0;
          const activitiesB = b.activities?.length || 0;
          return (activitiesA - activitiesB) * dirMod;
        case 'winRatio':
          // Calculate win ratio for both players using only played matches
          const matchesA = activities.filter(activity => 
            activity.type === "match" && activity.participants?.includes(a.id)
          );
          const matchesB = activities.filter(activity => 
            activity.type === "match" && activity.participants?.includes(b.id)
          );
          
          const statsA = calculatePlayerStats(a, matchesA);
          const statsB = calculatePlayerStats(b, matchesB);
          
          const winRatioA = statsA.matches > 0 ? (statsA.wins / statsA.matches) * 100 : 0;
          const winRatioB = statsB.matches > 0 ? (statsB.wins / statsB.matches) * 100 : 0;
          
          return (winRatioA - winRatioB) * dirMod;
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


import { useState } from "react";
import { Player, Activity } from "@/types/player";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

// Update the SortField type to include 'winrate'
export type SortField = 'name' | 'position' | 'grade' | 'activities' | 'winrate';

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

  const sortPlayers = (players: Player[], activities: Activity[] = []) => {
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
        case 'winrate':
          // Calculate winrate for both players
          const playerAMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(a.id)
          );
          const playerBMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(b.id)
          );
          
          const statsA = calculatePlayerStats(a, playerAMatches);
          const statsB = calculatePlayerStats(b, playerBMatches);
          
          return (statsA.winRate - statsB.winRate) * dirMod;
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

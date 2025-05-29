
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Player, Activity } from "@/types/player";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

export type SortField = 'name' | 'grade' | 'activities' | 'winrate' | 'goalsPerMatch';

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

export function usePlayerSorting() {
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  
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
      let valueA: any, valueB: any;
      
      switch (sortField) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'grade':
          valueA = a.grade || '';
          valueB = b.grade || '';
          break;
        case 'activities':
          valueA = a.activities?.length || 0;
          valueB = b.activities?.length || 0;
          break;
        case 'winrate':
          // Calculate winrate for sorting
          const aMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(a.id)
          );
          const bMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(b.id)
          );
          
          valueA = aMatches.length > 0 ? calculatePlayerStats(a, aMatches).winRate : 0;
          valueB = bMatches.length > 0 ? calculatePlayerStats(b, bMatches).winRate : 0;
          break;
        case 'goalsPerMatch':
          // Calculate goals per match for sorting
          const aMatchesGoals = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(a.id)
          );
          const bMatchesGoals = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(b.id)
          );
          
          const aStats = aMatchesGoals.length > 0 ? calculatePlayerStats(a, aMatchesGoals) : { totalGoals: 0, matches: 0 };
          const bStats = bMatchesGoals.length > 0 ? calculatePlayerStats(b, bMatchesGoals) : { totalGoals: 0, matches: 0 };
          
          valueA = aStats.matches > 0 ? aStats.totalGoals / aStats.matches : 0;
          valueB = bStats.matches > 0 ? bStats.totalGoals / bStats.matches : 0;
          break;
        default:
          valueA = '';
          valueB = '';
      }
      
      if (valueA < valueB) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  return {
    sortField,
    sortDirection,
    toggleSort,
    sortPlayers
  };
}

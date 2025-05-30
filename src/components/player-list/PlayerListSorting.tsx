
import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Player, Activity } from "@/types/player";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";

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

export function usePlayerSorting() {
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortPlayers = (players: Player[], activities: Activity[] = []) => {
    return [...players].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'grade':
          comparison = (a.grade || '').localeCompare(b.grade || '');
          break;
        case 'activities':
          comparison = (a.activities?.length || 0) - (b.activities?.length || 0);
          break;
        case 'winrate':
          const aMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(a.id)
          );
          const bMatches = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(b.id)
          );
          const aStats = calculatePlayerStats(a, aMatches);
          const bStats = calculatePlayerStats(b, bMatches);
          comparison = aStats.winRate - bStats.winRate;
          break;
        case 'goalsPerMatch':
          const aMatchesGoals = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(a.id)
          );
          const bMatchesGoals = activities.filter(activity => 
            activity.type === "match" && 
            activity.participants?.includes(b.id)
          );
          const aStatsGoals = calculatePlayerStats(a, aMatchesGoals);
          const bStatsGoals = calculatePlayerStats(b, bMatchesGoals);
          const aGoalsPerMatch = aStatsGoals.matches > 0 ? aStatsGoals.totalGoals / aStatsGoals.matches : 0;
          const bGoalsPerMatch = bStatsGoals.matches > 0 ? bStatsGoals.totalGoals / bStatsGoals.matches : 0;
          comparison = aGoalsPerMatch - bGoalsPerMatch;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortPlayers
  };
}

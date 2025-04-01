
import React from "react";
import { Player } from "@/types/player";
import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";

export type SortField = 'name' | 'position' | 'grade' | 'activities';
export type SortDirection = 'asc' | 'desc';

interface PlayerListSortingProps {
  sortField: SortField;
  sortDirection: SortDirection;
  toggleSort: (field: SortField) => void;
}

export const SortIcon = ({ field, sortField, sortDirection }: { 
  field: SortField; 
  sortField: SortField; 
  sortDirection: SortDirection; 
}) => {
  if (sortField !== field) return null;
  return sortDirection === 'asc' ? 
    <ArrowDownAZ className="inline ml-1 h-4 w-4" /> : 
    <ArrowUpAZ className="inline ml-1 h-4 w-4" />;
};

export function usePlayerSorting() {
  const [sortField, setSortField] = React.useState<SortField>('name');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('asc');

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getActivityCount = (player: Player) => {
    if (!player.activities || player.activities.length === 0) return 0;
    return player.activities.length;
  };

  const sortPlayers = (players: Player[]) => {
    return [...players].sort((a, b) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * direction;
        case 'position':
          const positionsA = a.positions ? a.positions.join(' ') : '';
          const positionsB = b.positions ? b.positions.join(' ') : '';
          return positionsA.localeCompare(positionsB) * direction;
        case 'grade':
          return a.grade.localeCompare(b.grade) * direction;
        case 'activities':
          const activitiesA = getActivityCount(a);
          const activitiesB = getActivityCount(b);
          return (activitiesA - activitiesB) * direction;
        default:
          return 0;
      }
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortPlayers
  };
}

export function PlayerListSorting({ sortField, sortDirection, toggleSort }: PlayerListSortingProps) {
  return (
    <>
      {/* This component doesn't render anything directly, it just provides the sorting logic */}
    </>
  );
}

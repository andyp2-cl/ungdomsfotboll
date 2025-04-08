
import React, { useState } from "react";
import { Player } from "@/types/player";
import { PlayerGoalStat } from "./calculateGoalStats";
import { ArrowDownAZ, ArrowUpAZ, ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface PlayerGoalsTableProps {
  playerStats: PlayerGoalStat[];
  onPlayerSelect?: (playerId: string) => void;
}

type SortField = "name" | "matches" | "goals" | "assists";
type SortDirection = "asc" | "desc";

export function PlayerGoalsTable({ playerStats, onPlayerSelect }: PlayerGoalsTableProps) {
  const [sortField, setSortField] = useState<SortField>("goals");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to descending for statistics, ascending for name
      setSortField(field);
      setSortDirection(field === "name" ? "asc" : "desc");
    }
  };

  const sortedStats = [...playerStats].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "matches") {
      comparison = a.matches - b.matches;
    } else if (sortField === "goals") {
      comparison = a.goals - b.goals;
    } else if (sortField === "assists") {
      comparison = a.assists - b.assists;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    if (field === "name") {
      return sortDirection === "asc" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowDownAZ className="h-4 w-4" />;
    } else {
      return sortDirection === "asc" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="border rounded-md mt-4">
      <div className="grid grid-cols-4 font-semibold p-3 border-b">
        <button 
          onClick={() => handleSort("name")} 
          className="flex items-center gap-1 hover:text-primary transition-colors"
        >
          Namn {getSortIcon("name")}
        </button>
        <button 
          onClick={() => handleSort("matches")} 
          className="text-center flex items-center justify-center gap-1 hover:text-primary transition-colors"
        >
          Matcher {getSortIcon("matches")}
        </button>
        <button 
          onClick={() => handleSort("goals")} 
          className="text-center flex items-center justify-center gap-1 hover:text-primary transition-colors"
        >
          Mål {getSortIcon("goals")}
        </button>
        <button 
          onClick={() => handleSort("assists")} 
          className="text-center flex items-center justify-center gap-1 hover:text-primary transition-colors"
        >
          Assist {getSortIcon("assists")}
        </button>
      </div>
      <div className="divide-y max-h-[500px] overflow-y-auto">
        {sortedStats.map(player => (
          <div 
            key={player.playerId} 
            className={`grid grid-cols-4 p-3 ${onPlayerSelect ? 'cursor-pointer hover:bg-muted' : ''}`}
            onClick={() => onPlayerSelect && onPlayerSelect(player.playerId)}
          >
            <div>{player.name}</div>
            <div className="text-center">{player.matches}</div>
            <div className="text-center text-green-600 font-semibold">{player.goals}</div>
            <div className="text-center text-blue-600 font-semibold">{player.assists}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

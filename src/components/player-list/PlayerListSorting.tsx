import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Player, Activity } from "@/types/player";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { calculateUniqueTeammates } from "@/utils/playerStatistics";

export type SortField = 'name' | 'grade' | 'activities' | 'winrate' | 'goalsPerMatch' | 'form' | 'development' | 'teammates';

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

// Function to calculate development spider value
export const calculateDevelopmentValue = (player: Player): number => {
  if (!player.development) return 0;
  const development = player.development;
  const attributes = [
    development.technical || 1,
    development.gameUnderstanding || 1,
    development.passing || 1,
    development.offensive || 1,
    development.defensive || 1,
    development.mentality || 1,
    development.shooting || 1,
    development.crossing || 1,
    development.finishing || 1,
    development.creativity || 1,
    development.tackling || 1,
    development.interception || 1,
    development.positioning || 1,
    development.heading || 1,
    development.speed || 1,
    development.stamina || 1,
    development.strength || 1,
    development.leadership || 1,
    development.composure || 1,
    development.workRate || 1
  ];
  const sum = attributes.reduce((acc, val) => acc + val, 0);
  const average = sum / attributes.length;
  return Math.round(average * 10) / 10;
};

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

  // Helper function to calculate form score for sorting
  const calculateFormScore = (player: Player, activities: Activity[]): number => {
    const today = new Date();
    const playerMatches = activities
      .filter(activity => {
        if (activity.type !== "match" || !activity.participants?.includes(player.id)) {
          return false;
        }
        const matchDate = new Date(activity.date);
        if (matchDate >= today) {
          return false;
        }
        return activity.isWin !== undefined || 
               (activity.homeScore !== undefined && activity.awayScore !== undefined) ||
               (activity.result && activity.result.includes('-'));
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-4);

    if (playerMatches.length === 0) return 0;

    // Calculate form score: Win = 3, Draw = 1, Loss = 0
    let formScore = 0;
    playerMatches.forEach(match => {
      if (match.isWin === true) {
        formScore += 3;
      } else if (match.isWin === false) {
        if (match.homeScore !== undefined && match.awayScore !== undefined) {
          if (match.homeScore === match.awayScore) {
            formScore += 1; // Draw
          }
          // Loss = 0, no addition needed
        }
      } else if (match.homeScore !== undefined && match.awayScore !== undefined) {
        if (match.homeScore > match.awayScore) {
          formScore += 3; // Win
        } else if (match.homeScore === match.awayScore) {
          formScore += 1; // Draw
        }
        // Loss = 0, no addition needed
      }
    });

    return formScore;
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
        case 'development':
          const aDevelopment = calculateDevelopmentValue(a);
          const bDevelopment = calculateDevelopmentValue(b);
          comparison = aDevelopment - bDevelopment;
          break;
        case 'form':
          const aForm = calculateFormScore(a, activities);
          const bForm = calculateFormScore(b, activities);
          comparison = aForm - bForm;
          break;
        case 'teammates':
          const aTeammates = calculateUniqueTeammates(a.id, activities);
          const bTeammates = calculateUniqueTeammates(b.id, activities);
          comparison = aTeammates - bTeammates;
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
    sortPlayers,
    calculateDevelopmentValue
  };
}

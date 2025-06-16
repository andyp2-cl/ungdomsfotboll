import React from "react";
import { Player, Activity } from "@/types/player";
import { PlayerListTable } from "./PlayerListTable";
import { PlayerGridView } from "./PlayerGridView";
import { usePlayerSorting } from "./PlayerListSorting";
import { useIsMobile } from "@/hooks/use-mobile";
import { calculatePlayerStats } from "@/components/player-match-history/utils/stats-calculator";
import { calculateDevelopmentValue } from "./PlayerListSorting";

interface PlayerListProps {
  players: Player[];
  viewMode?: "grid" | "list";
  onPlayerSelect: (player: Player) => void;
  onPlayerEdit?: (player: Player) => void;
  showCoaches?: boolean;
  activities?: Activity[];
}

export function PlayerList({ 
  players, 
  viewMode = "list", 
  onPlayerSelect, 
  onPlayerEdit,
  showCoaches = true,
  activities = []
}: PlayerListProps) {
  const { sortField, sortDirection, toggleSort, sortPlayers } = usePlayerSorting();
  const isMobile = useIsMobile();
  const [gridSortField, setGridSortField] = React.useState<string>('grade');

  // Filter out coaches if showCoaches is false
  const filteredPlayers = showCoaches 
    ? players
    : players.filter(player => {
        if (!player.positions) return true;
        return !player.positions.includes('TRÄNARE');
      });
    
  // Lägg till hjälpfunktion för form-score (kopiera från usePlayerSorting)
  function calculateFormScore(player, activities) {
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
  }

  // Anpassa sortering för grid
  const gridSortPlayers = (players: Player[], activities: Activity[]) => {
    return [...players].sort((a, b) => {
      let comparison = 0;
      switch (gridSortField) {
        case 'grade':
          // Sortera A först, sedan B, C, D, sedan övriga
          const gradeOrder = { 'A': 1, 'B': 2, 'C': 3, 'D': 4 };
          const aGrade = gradeOrder[a.grade] || 99;
          const bGrade = gradeOrder[b.grade] || 99;
          comparison = aGrade - bGrade;
          if (comparison === 0) {
            // Om samma grade, sortera på namn
            comparison = a.name.localeCompare(b.name);
          }
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
        case 'goalsPerGame':
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
        default:
          comparison = 0;
      }
      return comparison; // Sortera stigande för grade
    });
  };

  // Force grid view on mobile devices
  const effectiveViewMode = isMobile ? "grid" : viewMode;

  if (effectiveViewMode === "grid") {
    return (
      <PlayerGridView 
        players={gridSortPlayers(filteredPlayers, activities)} 
        onPlayerSelect={onPlayerSelect} 
        onPlayerEdit={onPlayerEdit}
        activities={activities}
        onSortChange={setGridSortField}
        sortField={gridSortField}
      />
    );
  }

  return (
    <PlayerListTable 
      players={sortPlayers(filteredPlayers, activities)} 
      activities={activities}
      sortField={sortField} 
      sortDirection={sortDirection} 
      toggleSort={toggleSort} 
      onPlayerSelect={onPlayerSelect} 
      onPlayerEdit={onPlayerEdit} 
    />
  );
}


import React from "react";
import { Player, Activity } from "@/types/player";
import { StatisticsTabsWrapper } from "./StatisticsTabsWrapper";

interface StatisticsTabContentProps {
  players: Player[];
  activities: Activity[];
  onPlayerSelect?: (playerId: string) => void;
}

export function StatisticsTabContent({ 
  players, 
  activities,
  onPlayerSelect
}: StatisticsTabContentProps) {
  // Calculate grade distribution data
  const gradeData = React.useMemo(() => {
    const gradeMap = new Map<string, number>();
    
    players.forEach(player => {
      const grade = player.grade;
      gradeMap.set(grade, (gradeMap.get(grade) || 0) + 1);
    });
    
    return Array.from(gradeMap.entries()).map(([grade, players]) => ({
      grade,
      players
    }));
  }, [players]);

  // Handle player selection by ID instead of by player object
  const handlePlayerIdSelect = (playerId: string) => {
    if (onPlayerSelect) {
      onPlayerSelect(playerId);
    }
  };

  return (
    <StatisticsTabsWrapper 
      players={players} 
      activities={activities} 
      gradeData={gradeData}
      onPlayerSelect={handlePlayerIdSelect}
    />
  );
}

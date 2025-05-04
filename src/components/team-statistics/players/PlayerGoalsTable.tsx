
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface PlayerGoalsTableProps {
  players: Player[];
  activities: Activity[];
  onPlayerClick?: (playerId: string) => void;
}

export function PlayerGoalsTable({ 
  players, 
  activities,
  onPlayerClick 
}: PlayerGoalsTableProps) {
  // Calculate goals for each player
  const playerGoals = React.useMemo(() => {
    const goalsMap: Record<string, number> = {};
    const assistsMap: Record<string, number> = {};
    
    // Process each activity with goals
    activities.forEach(activity => {
      if (!activity.player_stats) {
        return;
      }
      
      const playerStats = activity.player_stats;
      
      // Count goals
      if (playerStats.goals) {
        Object.entries(playerStats.goals).forEach(([playerId, count]) => {
          if (!goalsMap[playerId]) {
            goalsMap[playerId] = 0;
          }
          goalsMap[playerId] += typeof count === 'number' ? count : 0;
        });
      }
      
      // Count assists
      if (playerStats.assists) {
        Object.entries(playerStats.assists).forEach(([playerId, count]) => {
          if (!assistsMap[playerId]) {
            assistsMap[playerId] = 0;
          }
          assistsMap[playerId] += typeof count === 'number' ? count : 0;
        });
      }
    });
    
    // Create player stats array
    return players.map(player => ({
      player,
      goals: goalsMap[player.id] || 0,
      assists: assistsMap[player.id] || 0,
      points: (goalsMap[player.id] || 0) + (assistsMap[player.id] || 0)
    })).sort((a, b) => {
      // Sort by goals first, then assists
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }
      return b.assists - a.assists;
    });
    
  }, [players, activities]);
  
  // Check if we have any goals or assists
  const hasStats = playerGoals.some(p => p.goals > 0 || p.assists > 0);
  
  if (!hasStats) {
    return (
      <div className="text-center p-4 text-gray-500">
        Inga mål eller assists registrerade
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Spelare</TableHead>
          <TableHead className="text-center">Mål</TableHead>
          <TableHead className="text-center">Assist</TableHead>
          <TableHead className="text-center">Poäng</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {playerGoals.slice(0, 10).map(({ player, goals, assists, points }) => {
          // Skip players with no goals or assists
          if (goals === 0 && assists === 0) {
            return null;
          }
          
          return (
            <TableRow key={player.id}>
              <TableCell>
                {onPlayerClick ? (
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-normal justify-start"
                    onClick={() => onPlayerClick?.(player.id)}
                  >
                    {player.name}
                  </Button>
                ) : (
                  player.name
                )}
              </TableCell>
              <TableCell className="text-center">{goals}</TableCell>
              <TableCell className="text-center">{assists}</TableCell>
              <TableCell className="text-center font-medium">{points}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

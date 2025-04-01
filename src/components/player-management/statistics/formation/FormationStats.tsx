
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PositionDistributionChart } from './PositionDistributionChart';
import { PositionBalance } from './PositionBalance';
import { Player, PlayerPosition } from '@/types/player';
import { getPositionColor, getPositionLabel } from './positionUtils';

interface FormationStatsProps {
  players: Player[];
  selectedFormation: string;
}

export function FormationStats({ players, selectedFormation }: FormationStatsProps) {
  // Calculate position stats
  const positionStats = React.useMemo(() => {
    const counts: Record<string, number> = {};
    
    players.forEach(player => {
      if (player.positions && !player.positions.includes("TRÄNARE")) {
        player.positions.forEach(position => {
          counts[position] = (counts[position] || 0) + 1;
        });
      }
    });
    
    return Object.entries(counts)
      .filter(([position]) => ["MV", "BACK", "MF", "ANF"].includes(position))
      .map(([name, value]) => ({
        name,
        value,
        color: getPositionColor(name as PlayerPosition)
      }));
  }, [players]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>Positionsfördelning</CardTitle>
        </CardHeader>
        <CardContent>
          <PositionDistributionChart positionStats={positionStats} />
        </CardContent>
      </Card>
      
      <PositionBalance 
        selectedFormation={selectedFormation} 
        positionStats={positionStats}
      />
    </div>
  );
}


import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FORMATIONS } from './formationData';
import { getPositionLabel, getPositionColor } from './positionUtils';
import { PlayerPosition } from '@/types/player';

interface PositionStat {
  name: string;
  value: number;
  color: string;
}

interface PositionBalanceProps {
  selectedFormation: string;
  positionStats: PositionStat[];
}

export function PositionBalance({ selectedFormation, positionStats }: PositionBalanceProps) {
  // Calculate position balance (ideal vs. actual)
  const getPositionBalance = () => {
    const formation = FORMATIONS[selectedFormation as keyof typeof FORMATIONS];
    if (!formation) return [];

    // Count positions in formation
    const formationPositions: Record<string, number> = {
      "MV": 0,
      "BACK": 0,
      "MF": 0,
      "ANF": 0
    };

    formation.positions.forEach(pos => {
      formationPositions[pos.position]++;
    });

    // Create data for comparison
    return Object.entries(formationPositions).map(([pos, idealCount]) => {
      const actualCount = positionStats.find(p => p.name === pos)?.value || 0;
      const position = pos as PlayerPosition;
      return {
        position,
        name: getPositionLabel(position),
        ideal: idealCount,
        actual: actualCount,
        balance: actualCount - idealCount,
        color: getPositionColor(position)
      };
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Positionsbalans ({selectedFormation})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4">
          {getPositionBalance().map((item) => (
            <div key={item.position} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="font-medium text-lg">{item.name}</div>
              <div className="text-2xl font-bold mt-1">{item.actual} / {item.ideal}</div>
              <div className={`text-sm mt-1 ${item.balance === 0 ? 'text-green-600' : item.balance > 0 ? 'text-blue-600' : 'text-red-500'}`}>
                {item.balance === 0 ? 'Balanserad' : item.balance > 0 ? `+${item.balance} spelare` : `${item.balance} spelare`}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

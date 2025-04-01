
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { getPositionColor, getPositionLabel, getPlayersForPosition } from './positionUtils';
import { Player, PlayerPosition } from '@/types/player';

interface PositionPlayerListsProps {
  players: Player[];
}

export function PositionPlayerLists({ players }: PositionPlayerListsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {["MV", "BACK", "MF", "ANF"].map((position) => (
        <Card key={position}>
          <CardHeader className="pb-2">
            <CardTitle className="text-base" style={{ color: getPositionColor(position as PlayerPosition) }}>
              {getPositionLabel(position as PlayerPosition)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {getPlayersForPosition(players, position as PlayerPosition).map(player => (
                <div key={player.id} className="flex items-center justify-between">
                  <span>{player.name}</span>
                  <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                    {player.grade}
                  </span>
                </div>
              ))}
              {getPlayersForPosition(players, position as PlayerPosition).length === 0 && (
                <div className="text-gray-500 italic">Inga spelare</div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

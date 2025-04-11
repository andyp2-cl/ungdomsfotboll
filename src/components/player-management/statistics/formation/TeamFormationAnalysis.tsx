
import React, { useMemo, useState } from 'react';
import { Player, PlayerPosition } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, LayoutGrid } from "lucide-react";
import { getPositionColor, getFieldPlayers } from './positionUtils';
import { PositionDistributionChart } from './PositionDistributionChart';
import { FormationField } from './FormationField';
import { PositionBalance } from './PositionBalance';
import { PositionPlayerLists } from './PositionPlayerLists';

interface TeamFormationAnalysisProps {
  players: Player[];
}

export function TeamFormationAnalysis({ players }: TeamFormationAnalysisProps) {
  const [selectedFormation, setSelectedFormation] = useState<string>("4-4-2");

  // Filter out trainers
  const fieldPlayers = useMemo(() => getFieldPlayers(players), [players]);

  // Calculate position distribution
  const positionStats = useMemo(() => {
    const positions: Record<string, number> = {
      "MV": 0,
      "BACK": 0,
      "MF": 0,
      "ANF": 0
    };

    // Count players in each position
    fieldPlayers.forEach(player => {
      if (player.positions && player.positions.length > 0) {
        // Skip if position is TRÄNARE
        player.positions.forEach(position => {
          if (position !== "TRÄNARE" && positions[position] !== undefined) {
            positions[position]++;
          }
        });
      }
    });

    // Map to chart data format
    return Object.entries(positions).map(([pos, count]) => ({
      name: pos,
      value: count,
      color: getPositionColor(pos as PlayerPosition)
    }));
  }, [fieldPlayers]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5" />
              Positionsfördelning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PositionDistributionChart positionStats={positionStats} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Spelformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={selectedFormation} onValueChange={setSelectedFormation} className="mb-4">
              <TabsList className="mb-2">
                <TabsTrigger value="4-4-2">4-4-2</TabsTrigger>
                <TabsTrigger value="4-3-3">4-3-3</TabsTrigger>
                <TabsTrigger value="3-5-2">3-5-2</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <FormationField selectedFormation={selectedFormation} />
          </CardContent>
        </Card>
      </div>

      <PositionBalance 
        selectedFormation={selectedFormation} 
        positionStats={positionStats} 
      />
      
      <PositionPlayerLists players={fieldPlayers} />
    </div>
  );
}

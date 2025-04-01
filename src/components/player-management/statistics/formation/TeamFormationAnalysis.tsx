
import React, { useMemo, useState } from 'react';
import { Player, PlayerPosition } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UsersRound, LayoutGrid } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';
import { getGradeColor } from '@/utils/gradeUtils';

// Formation templates - arrange players' positions on a virtual field
const FORMATIONS = {
  "4-4-2": {
    name: "4-4-2",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 0, position: "BACK" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 1, col: 4, position: "BACK" },
      { row: 2, col: 0, position: "MF" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 2, col: 4, position: "MF" },
      { row: 3, col: 1, position: "ANF" },
      { row: 3, col: 3, position: "ANF" },
    ]
  },
  "4-3-3": {
    name: "4-3-3",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 0, position: "BACK" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 1, col: 4, position: "BACK" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 2, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 3, col: 0, position: "ANF" },
      { row: 3, col: 2, position: "ANF" },
      { row: 3, col: 4, position: "ANF" },
    ]
  },
  "3-5-2": {
    name: "3-5-2",
    positions: [
      { row: 0, col: 2, position: "MV" },
      { row: 1, col: 1, position: "BACK" },
      { row: 1, col: 2, position: "BACK" },
      { row: 1, col: 3, position: "BACK" },
      { row: 2, col: 0, position: "MF" },
      { row: 2, col: 1, position: "MF" },
      { row: 2, col: 2, position: "MF" },
      { row: 2, col: 3, position: "MF" },
      { row: 2, col: 4, position: "MF" },
      { row: 3, col: 1, position: "ANF" },
      { row: 3, col: 3, position: "ANF" },
    ]
  }
};

interface PositionStat {
  name: string;
  value: number;
  color: string;
}

interface TeamFormationAnalysisProps {
  players: Player[];
}

export function TeamFormationAnalysis({ players }: TeamFormationAnalysisProps) {
  const [selectedFormation, setSelectedFormation] = useState<string>("4-4-2");

  // Move getPositionColor function definition before it's used
  // Get position color
  const getPositionColor = (position: PlayerPosition): string => {
    switch (position) {
      case "MV": return "#e11d48"; // Red
      case "BACK": return "#fb923c"; // Orange
      case "MF": return "#22c55e"; // Green
      case "ANF": return "#3b82f6"; // Blue
      default: return "#9ca3af"; // Gray
    }
  };

  // Filter out trainers
  const fieldPlayers = useMemo(() => 
    players.filter(player => !player.positions?.includes("TRÄNARE")),
    [players]
  );

  // Calculate position distribution
  const positionStats: PositionStat[] = useMemo(() => {
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
        const position = player.positions[0];
        if (position !== "TRÄNARE" && positions[position] !== undefined) {
          positions[position]++;
        }
      }
    });

    // Map to chart data format
    return Object.entries(positions).map(([pos, count]) => ({
      name: pos,
      value: count,
      color: getPositionColor(pos as PlayerPosition)
    }));
  }, [fieldPlayers]);

  // Position label
  const getPositionLabel = (position: PlayerPosition): string => {
    switch (position) {
      case "MV": return "Målvakt";
      case "BACK": return "Back";
      case "MF": return "Mittfältare";
      case "ANF": return "Anfallare";
      case "TRÄNARE": return "Tränare";
    }
  };

  // Find players for each position
  const getPlayersForPosition = (position: PlayerPosition): Player[] => {
    return fieldPlayers.filter(player => 
      player.positions?.includes(position)
    );
  };

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
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={positionStats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${getPositionLabel(name as PlayerPosition)} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {positionStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value} spelare`, 
                      getPositionLabel(name as PlayerPosition)
                    ]}
                  />
                  <Legend formatter={(value) => getPositionLabel(value as PlayerPosition)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
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
            
            <div className="relative bg-green-800 rounded-md aspect-[4/3] mb-4">
              {FORMATIONS[selectedFormation as keyof typeof FORMATIONS]?.positions.map((pos, index) => (
                <div 
                  key={index} 
                  className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-sm font-medium border-2 border-white text-gray-900 transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    left: `${(pos.col + 0.5) * 20}%`, 
                    top: `${(pos.row + 0.5) * 25}%`,
                    borderColor: getPositionColor(pos.position as PlayerPosition)
                  }}
                >
                  {pos.position}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                {getPlayersForPosition(position as PlayerPosition).map(player => (
                  <div key={player.id} className="flex items-center justify-between">
                    <span>{player.name}</span>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                      {player.grade}
                    </span>
                  </div>
                ))}
                {getPlayersForPosition(position as PlayerPosition).length === 0 && (
                  <div className="text-gray-500 italic">Inga spelare</div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

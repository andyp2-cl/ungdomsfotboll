
import React, { useMemo } from "react";
import { Player } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend 
} from 'recharts';

interface ParticipationTabContentProps {
  players: Player[];
}

export function ParticipationTabContent({ players }: ParticipationTabContentProps) {
  // Beräkna antal spelare per nivå och position
  const gradeDistribution = useMemo(() => {
    const nonCoaches = players.filter(p => !p.positions?.includes("TRÄNARE"));
    
    const gradeData = nonCoaches.reduce((acc, player) => {
      const grade = player.grade;
      if (!acc[grade]) {
        acc[grade] = { name: `Nivå ${grade}`, value: 0, color: getGradeColor(grade) };
      }
      acc[grade].value++;
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>);
    
    return Object.values(gradeData);
  }, [players]);

  const positionDistribution = useMemo(() => {
    const nonCoaches = players.filter(p => !p.positions?.includes("TRÄNARE"));
    
    const positionMap: Record<string, { name: string; value: number; color: string }> = {
      'MV': { name: 'Målvakt', value: 0, color: '#4299E1' },
      'BACK': { name: 'Back', value: 0, color: '#48BB78' },
      'MF': { name: 'Mittfältare', value: 0, color: '#F6AD55' },
      'ANF': { name: 'Anfallare', value: 0, color: '#F56565' }
    };
    
    nonCoaches.forEach(player => {
      if (player.positions) {
        player.positions.forEach(pos => {
          if (pos !== 'TRÄNARE' && positionMap[pos]) {
            positionMap[pos].value++;
          }
        });
      }
    });
    
    return Object.values(positionMap).filter(pos => pos.value > 0);
  }, [players]);

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Hjälpfunktion för att hämta färg baserat på nivå
  function getGradeColor(grade: string): string {
    switch (grade) {
      case 'A': return '#3B82F6'; // blue-500
      case 'B': return '#10B981'; // emerald-500
      case 'C': return '#F59E0B'; // amber-500
      case 'D': return '#EF4444'; // red-500
      default: return '#6B7280';  // gray-500
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Spelardistribution per nivå</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gradeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {gradeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} spelare`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Positionsfördelning</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={positionDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {positionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} spelare`, '']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Spelaröversikt</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {players.length}
              </div>
              <div className="text-sm text-blue-500">Totalt antal spelare</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-600">
                {players.filter(p => !p.positions?.includes("TRÄNARE")).length}
              </div>
              <div className="text-sm text-green-500">Aktiva spelare</div>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-amber-600">
                {players.filter(p => p.positions?.includes("TRÄNARE")).length}
              </div>
              <div className="text-sm text-amber-500">Tränare</div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-600">
                {players.filter(p => p.activities && p.activities.length > 0).length}
              </div>
              <div className="text-sm text-purple-500">Aktiva senaste perioden</div>
            </div>
          </div>
          
          <div className="mt-8 grid gap-4">
            {['A', 'B', 'C', 'D'].map(grade => {
              const gradePlayers = players.filter(p => p.grade === grade);
              if (gradePlayers.length === 0) return null;
              
              return (
                <div key={grade} className="border p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2">Nivå {grade}</h3>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">{gradePlayers.length}</div>
                      <div className="text-xs text-gray-500">Spelare</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">
                        {gradePlayers.filter(p => p.positions?.includes('MV')).length}
                      </div>
                      <div className="text-xs text-gray-500">Målvakter</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">
                        {gradePlayers.filter(p => p.positions?.includes('BACK')).length}
                      </div>
                      <div className="text-xs text-gray-500">Backar</div>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded">
                      <div className="font-bold">
                        {gradePlayers.filter(p => 
                          p.positions?.includes('MF') || p.positions?.includes('ANF')
                        ).length}
                      </div>
                      <div className="text-xs text-gray-500">MF/ANF</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

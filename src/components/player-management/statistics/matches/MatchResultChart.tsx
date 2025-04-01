
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { TrophyIcon, MinusIcon, XIcon } from "lucide-react";

interface MatchResultChartProps {
  matchStats: {
    total: number;
    wins: number;
    draws: number;
    losses: number;
    winPercentage: number;
    homeWins: number;
    awayWins: number;
  };
}

export function MatchResultChart({ matchStats }: MatchResultChartProps) {
  // Format data for charts
  const matchResultData = [
    { name: 'Vinster', value: matchStats.wins, color: '#22c55e' },
    { name: 'Oavgjorda', value: matchStats.draws, color: '#64748b' },
    { name: 'Förluster', value: matchStats.losses, color: '#ef4444' }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-md shadow-md border">
          <p className="font-semibold text-sm flex items-center">
            {data.name}{' '}
            <span className="ml-2 rounded-full w-3 h-3" style={{ backgroundColor: data.color }}></span>
          </p>
          <p className="text-sm mt-1">
            <span className="font-medium">{data.value}</span> matcher 
            ({((data.value / matchStats.total) * 100).toFixed(0)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const renderCustomLegend = () => {
    return (
      <div className="flex justify-center gap-4 mt-4">
        {matchResultData.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm font-medium">
              {entry.name}: {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <TrophyIcon className="h-5 w-5 mr-2 text-amber-500" />
          Matchresultat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
            <div className="flex items-center text-green-600">
              <TrophyIcon className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Vinster</span>
            </div>
            <div className="text-2xl font-bold text-green-700 mt-1">{matchStats.wins}</div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center text-slate-600">
              <MinusIcon className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Oavgjorda</span>
            </div>
            <div className="text-2xl font-bold text-slate-700 mt-1">{matchStats.draws}</div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-lg border border-red-200">
            <div className="flex items-center text-red-600">
              <XIcon className="h-4 w-4 mr-1" />
              <span className="text-xs font-medium">Förluster</span>
            </div>
            <div className="text-2xl font-bold text-red-700 mt-1">{matchStats.losses}</div>
          </div>
        </div>
        
        <div className="h-[230px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={matchResultData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {matchResultData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="white" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {renderCustomLegend()}
        
        <div className="mt-4 flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
          <div>
            <span className="text-xs font-medium text-amber-700">Vinstprocent</span>
            <div className="text-xl font-bold text-amber-800">{matchStats.winPercentage}%</div>
          </div>
          <div>
            <span className="text-xs font-medium text-amber-700">Hemma-Borta</span>
            <div className="text-xl font-bold text-amber-800">{matchStats.homeWins}-{matchStats.awayWins}</div>
          </div>
          <div>
            <span className="text-xs font-medium text-amber-700">Matcher totalt</span>
            <div className="text-xl font-bold text-amber-800">{matchStats.total}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

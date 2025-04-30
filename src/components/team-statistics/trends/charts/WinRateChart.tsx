
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { WinRateData } from '../utils/activityDataUtils';
import { ChartContainer } from '@/components/ui/chart';
import { TrendingUp } from 'lucide-react';

interface WinRateChartProps {
  data: WinRateData[];
}

export const WinRateChart: React.FC<WinRateChartProps> = ({ data }) => {
  // Chart configuration with improved colors
  const chartConfig = {
    winRate: { color: "#8B5CF6", label: "Vinstprocent" },
    wins: { color: "#16A34A", label: "Vinster" },
    losses: { color: "#EF4444", label: "Förluster" },
    draws: { color: "#F59E0B", label: "Oavgjorda" },
  };

  // Calculate average win rate
  const averageWinRate = data.reduce((sum, month) => sum + month.winRate, 0) / (data.length || 1);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Vinstprocent
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Lagets vinstprocent över de senaste 6 månaderna
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} tickFormatter={(tick) => `${tick}%`} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      const totalMatches = item.wins + item.losses + item.draws;
                      
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{label}</div>
                          <div className="mt-1 grid gap-1">
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-1">
                                <div 
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: chartConfig.winRate.color }}
                                />
                                <span className="text-sm text-muted-foreground">
                                  Vinstprocent:
                                </span>
                              </div>
                              <span className="font-medium">{item.winRate}%</span>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1 pt-1 border-t">
                              Totalt {totalMatches} matcher
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-muted-foreground">Vinster:</span>
                              <span className="font-medium text-green-600">{item.wins}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-muted-foreground">Förluster:</span>
                              <span className="font-medium text-red-600">{item.losses}</span>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm text-muted-foreground">Oavgjorda:</span>
                              <span className="font-medium text-amber-500">{item.draws}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <ReferenceLine 
                  y={averageWinRate} 
                  label={{ 
                    value: `Genomsnitt: ${averageWinRate.toFixed(0)}%`, 
                    position: 'insideBottomRight',
                    fill: '#6b7280',
                    fontSize: 12
                  }} 
                  stroke="#6b7280" 
                  strokeDasharray="3 3" 
                />
                <Line 
                  type="monotone" 
                  dataKey="winRate" 
                  name="Vinstprocent"
                  stroke={chartConfig.winRate.color} 
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 1, fill: 'white' }}
                  activeDot={{ r: 7, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

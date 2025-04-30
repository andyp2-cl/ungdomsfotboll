
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyActivityData } from '../utils/activityDataUtils';
import { ChartContainer } from '@/components/ui/chart';
import { Calendar } from 'lucide-react';

interface MonthlyActivityChartProps {
  data: MonthlyActivityData[];
}

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({ data }) => {
  // Chart configuration with improved colors
  const chartConfig = {
    matches: { color: "#6E59A5", label: "Matcher" },
    trainings: { color: "#33C3F0", label: "Träningar" },
    cups: { color: "#F97316", label: "Cuper" }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex flex-col space-y-1">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Aktiviteter per månad
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Översikt över matcher, träningar och cuper
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-md">
                          <div className="font-medium">{label}</div>
                          <div className="mt-1 grid gap-1">
                            {payload.map((entry, index) => (
                              <div 
                                key={`item-${index}`}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-1">
                                  <div 
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span className="text-sm text-muted-foreground">
                                    {entry.name === "matches" ? "Matcher" : 
                                     entry.name === "trainings" ? "Träningar" : 
                                     entry.name === "cups" ? "Cuper" : entry.name}:
                                  </span>
                                </div>
                                <span className="font-medium">{entry.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend formatter={(value) => 
                  value === "matches" ? "Matcher" : 
                  value === "trainings" ? "Träningar" : 
                  value === "cups" ? "Cuper" : value
                } />
                <Bar dataKey="matches" name="matches" fill={chartConfig.matches.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="trainings" name="trainings" fill={chartConfig.trainings.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cups" name="cups" fill={chartConfig.cups.color} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

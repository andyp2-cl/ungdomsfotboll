
import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Activity } from "@/types/player";
import { Calendar } from "lucide-react";
import { format, parseISO, isSameMonth, subMonths, startOfMonth } from "date-fns";
import { sv } from "date-fns/locale";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface MonthlyActivityChartProps {
  activities: Activity[];
}

export function MonthlyActivityChart({ activities }: MonthlyActivityChartProps) {
  const monthlyData = useMemo(() => {
    // Get current date and calculate 6 months back
    const today = new Date();
    const monthsData = [];
    
    // Create array of last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(today, i);
      const monthStart = startOfMonth(monthDate);
      
      monthsData.push({
        month: monthStart,
        label: format(monthStart, 'MMM', { locale: sv }),
        matches: 0,
        cups: 0,
        total: 0
      });
    }
    
    // Count activities by month and type
    activities.forEach(activity => {
      const activityDate = parseISO(activity.date);
      
      // Find matching month
      const monthData = monthsData.find(data => 
        isSameMonth(data.month, activityDate)
      );
      
      if (monthData) {
        if (activity.type === 'match') {
          monthData.matches += 1;
        } else if (activity.type === 'cup') {
          monthData.cups += 1;
        }
        monthData.total += 1;
      }
    });
    
    return monthsData;
  }, [activities]);

  const chartConfig = {
    matches: { color: "#4f46e5", label: "Matcher" },
    cups: { color: "#ec4899", label: "Cuper" },
    total: { color: "#10b981", label: "Totalt" }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Aktivitetstrend
        </CardTitle>
        <CardDescription>
          Antal aktiviteter över senaste 6 månaderna
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="label" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis allowDecimals={false} />
                <ChartTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="font-medium">{label}</div>
                          <div className="grid grid-cols-1 gap-1 mt-1">
                            {payload.map((entry, index) => (
                              <div key={index} className="flex items-center">
                                <div
                                  className="w-3 h-3 rounded mr-1"
                                  style={{ backgroundColor: entry.color }}
                                ></div>
                                <span className="text-sm">
                                  {entry.name}: {entry.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="matches" 
                  name="Matcher" 
                  stroke="#4f46e5" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="cups" 
                  name="Cuper" 
                  stroke="#ec4899" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  name="Totalt" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

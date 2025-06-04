
import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerDevelopment } from "@/types/player";

interface DevelopmentTrendChartProps {
  trendData: Array<{
    period: string;
    average: number;
    technical: number;
    offensive: number;
    defensive: number;
  }>;
  className?: string;
}

export function DevelopmentTrendChart({ trendData, className = "" }: DevelopmentTrendChartProps) {
  if (!trendData || trendData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Utvecklingstrend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Ingen utvecklingsdata tillgänglig
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Utvecklingstrend över tid</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis domain={[1, 10]} />
              <Tooltip 
                formatter={(value, name) => [Number(value).toFixed(1), name]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#8884d8" 
                strokeWidth={3}
                name="Genomsnitt"
              />
              <Line 
                type="monotone" 
                dataKey="technical" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Teknik"
              />
              <Line 
                type="monotone" 
                dataKey="offensive" 
                stroke="#ffc658" 
                strokeWidth={2}
                name="Offensiv"
              />
              <Line 
                type="monotone" 
                dataKey="defensive" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="Defensiv"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

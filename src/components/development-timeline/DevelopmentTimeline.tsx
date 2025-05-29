
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface DevelopmentTimelineProps {
  playerId: string;
  playerName: string;
  timelineData: Array<{
    date: string;
    technical: number;
    offensive: number;
    defensive: number;
    mentality: number;
    gameUnderstanding: number;
    passing: number;
  }>;
  className?: string;
}

export function DevelopmentTimeline({
  playerId,
  playerName,
  timelineData,
  className = ""
}: DevelopmentTimelineProps) {
  
  // Format data for chart
  const chartData = timelineData.map(entry => ({
    ...entry,
    date: format(new Date(entry.date), 'MMM dd')
  }));

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Utvecklingshistorik - {playerName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[1, 10]} />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="technical" 
              stroke="hsl(var(--primary))" 
              name="Teknik"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="offensive" 
              stroke="#ff6b6b" 
              name="Offensiv"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="defensive" 
              stroke="#4ecdc4" 
              name="Defensiv"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="mentality" 
              stroke="#45b7d1" 
              name="Mentalitet"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="gameUnderstanding" 
              stroke="#f9ca24" 
              name="Spelförståelse"
              strokeWidth={2}
            />
            <Line 
              type="monotone" 
              dataKey="passing" 
              stroke="#6c5ce7" 
              name="Passning"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}


import React from "react";
import { PlayerDevelopment } from "@/types/player";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DevelopmentChartProps {
  development?: PlayerDevelopment;
  className?: string;
}

export function DevelopmentChart({ development, className }: DevelopmentChartProps) {
  console.log("Development data received in DevelopmentChart:", development);
  
  // Default values if development data is not provided
  const defaultDevelopment: PlayerDevelopment = {
    technical: 1,
    gameUnderstanding: 1,
    passing: 1,
    offensive: 1,
    defensive: 1,
    mentality: 1
  };
  
  // Use provided development data or defaults, with fallbacks for each property
  const data = development ? {
    technical: development.technical ?? defaultDevelopment.technical,
    gameUnderstanding: development.gameUnderstanding ?? defaultDevelopment.gameUnderstanding,
    passing: development.passing ?? defaultDevelopment.passing,
    offensive: development.offensive ?? defaultDevelopment.offensive,
    defensive: development.defensive ?? defaultDevelopment.defensive,
    mentality: development.mentality ?? defaultDevelopment.mentality
  } : defaultDevelopment;
  
  console.log("Final data used for radar chart:", data);
  
  // Transform data for the radar chart
  const chartData = [
    { subject: "Teknik", value: data.technical, fullMark: 10 },
    { subject: "Spelförståelse", value: data.gameUnderstanding, fullMark: 10 },
    { subject: "Passningsspel", value: data.passing, fullMark: 10 },
    { subject: "Offensiv", value: data.offensive, fullMark: 10 },
    { subject: "Defensiv", value: data.defensive, fullMark: 10 },
    { subject: "Mentalitet", value: data.mentality, fullMark: 10 }
  ];

  return (
    <Card className={className}>
      <CardHeader className="py-3">
        <CardTitle className="text-base">Utveckling</CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis domain={[0, 10]} axisLine={false} tick={false} />
              <Radar
                name="Utveckling"
                dataKey="value"
                stroke="#2563eb"
                fill="#3b82f6"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

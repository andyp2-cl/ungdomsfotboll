
import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { PlayerDevelopment } from "@/types/player";

interface DevelopmentChartProps {
  development?: PlayerDevelopment;
  className?: string;
  minimal?: boolean;
  showExtended?: boolean;
}

export function DevelopmentChart({ 
  development, 
  className = "", 
  minimal = false,
  showExtended = false 
}: DevelopmentChartProps) {
  if (!development) {
    return (
      <div className={`flex items-center justify-center h-full ${className}`}>
        <p className="text-muted-foreground text-sm">Ingen utvecklingsdata tillgänglig</p>
      </div>
    );
  }

  // Core data always shown
  const coreData = [
    {
      subject: 'Teknik',
      value: development.technical || 1,
      fullMark: 10,
    },
    {
      subject: 'Spelförståelse',
      value: development.gameUnderstanding || 1,
      fullMark: 10,
    },
    {
      subject: 'Passning',
      value: development.passing || 1,
      fullMark: 10,
    },
    {
      subject: 'Offensiv',
      value: development.offensive || 1,
      fullMark: 10,
    },
    {
      subject: 'Defensiv',
      value: development.defensive || 1,
      fullMark: 10,
    },
    {
      subject: 'Mentalitet',
      value: development.mentality || 1,
      fullMark: 10,
    },
  ];

  // Extended data with all new fields
  const extendedData = [
    // Core values
    { subject: 'Teknik', value: development.technical || 1, fullMark: 10 },
    { subject: 'Spelförståelse', value: development.gameUnderstanding || 1, fullMark: 10 },
    { subject: 'Passning', value: development.passing || 1, fullMark: 10 },
    
    // Offensive values
    { subject: 'Skott', value: development.shooting || 1, fullMark: 10 },
    { subject: 'Avslut', value: development.finishing || 1, fullMark: 10 },
    { subject: 'Inlägg', value: development.crossing || 1, fullMark: 10 },
    { subject: 'Kreativitet', value: development.creativity || 1, fullMark: 10 },
    
    // Defensive values
    { subject: 'Tacklingar', value: development.tackling || 1, fullMark: 10 },
    { subject: 'Avbrott', value: development.interception || 1, fullMark: 10 },
    { subject: 'Positionering', value: development.positioning || 1, fullMark: 10 },
    { subject: 'Huvudspel', value: development.heading || 1, fullMark: 10 },
    
    // Physical values
    { subject: 'Snabbhet', value: development.speed || 1, fullMark: 10 },
    { subject: 'Uthållighet', value: development.stamina || 1, fullMark: 10 },
    { subject: 'Styrka', value: development.strength || 1, fullMark: 10 },
    
    // Mental values
    { subject: 'Ledarskap', value: development.leadership || 1, fullMark: 10 },
    { subject: 'Lugn', value: development.composure || 1, fullMark: 10 },
    { subject: 'Arbetsmoral', value: development.workRate || 1, fullMark: 10 },
  ];

  const chartData = showExtended ? extendedData : coreData;

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <PolarGrid />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fontSize: minimal ? 10 : 12 }}
            className="text-muted-foreground"
          />
          <PolarRadiusAxis 
            angle={0} 
            domain={[0, 10]} 
            tick={{ fontSize: minimal ? 8 : 10 }}
            className="text-muted-foreground"
          />
          <Radar
            name="Utveckling"
            dataKey="value"
            stroke="hsl(var(--primary))"
            fill="hsl(var(--primary))"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          {!minimal && (
            <Legend 
              wrapperStyle={{ 
                fontSize: '12px',
                paddingTop: '10px'
              }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

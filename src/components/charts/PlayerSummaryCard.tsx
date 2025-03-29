
import React from 'react';
import { Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getGradeColor } from '@/utils/gradeUtils';

interface GradeData {
  grade: string;
  players: number;
}

interface PlayerSummaryCardProps {
  data: GradeData[];
}

export function PlayerSummaryCard({ data }: PlayerSummaryCardProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Spelarsammanfattning
        </CardTitle>
        <CardDescription>Översikt av spelarfördelning</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map(stat => (
            <div 
              key={stat.grade} 
              className="flex flex-col items-center justify-center p-4 border rounded-lg"
              style={{ borderColor: getGradeColor(stat.grade), borderWidth: '2px' }}
            >
              <span className="text-2xl font-bold">{stat.players}</span>
              <span className="text-sm text-muted-foreground">Nivå {stat.grade}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

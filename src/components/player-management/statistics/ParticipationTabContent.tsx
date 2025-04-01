
import React, { useMemo } from "react";
import { Player, PlayerGrade } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getGradeColor } from '@/utils/gradeUtils';

interface ParticipationTabContentProps {
  players: Player[];
}

export function ParticipationTabContent({ players }: ParticipationTabContentProps) {
  // Get player participation by grade
  const participationByGrade = useMemo(() => {
    const gradeParticipation: Record<PlayerGrade, { 
      grade: string, 
      players: number, 
      activities: number,
      averageActivities: number,
      color: string 
    }> = {
      'A': { grade: 'A', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('A') },
      'B': { grade: 'B', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('B') },
      'C': { grade: 'C', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('C') },
      'D': { grade: 'D', players: 0, activities: 0, averageActivities: 0, color: getGradeColor('D') }
    };
    
    players.forEach(player => {
      if (player.grade in gradeParticipation) {
        gradeParticipation[player.grade].players++;
        gradeParticipation[player.grade].activities += player.activities?.length || 0;
      }
    });
    
    // Calculate average activities per player in each grade
    Object.keys(gradeParticipation).forEach(grade => {
      const key = grade as PlayerGrade;
      if (gradeParticipation[key].players > 0) {
        gradeParticipation[key].averageActivities = 
          Math.round((gradeParticipation[key].activities / gradeParticipation[key].players) * 10) / 10;
      }
    });
    
    return Object.values(gradeParticipation);
  }, [players]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Deltagande per nivå</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationByGrade}>
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip formatter={(value, name) => [value, name === 'players' ? 'Antal spelare' : 'Snitt aktiviteter']} />
                <Legend payload={[
                  { value: 'Antal spelare', type: 'square', color: '#64748b' },
                  { value: 'Snitt aktiviteter', type: 'square', color: '#3b82f6' }
                ]} />
                <Bar dataKey="players" name="Antal spelare" fill="#64748b" />
                <Bar dataKey="averageActivities" name="Snitt aktiviteter" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Detaljerad nivåstatistik</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {participationByGrade.map(grade => (
              <div key={grade.grade} className="p-3 border rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Nivå {grade.grade}</span>
                  <span>{grade.players} spelare</span>
                </div>
                <div className="flex justify-between mb-2 text-sm">
                  <span>Antal aktiviteter:</span>
                  <span>{grade.activities}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Genomsnitt per spelare:</span>
                  <span>{grade.averageActivities}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, grade.averageActivities * 10)}%`,
                      backgroundColor: grade.color
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

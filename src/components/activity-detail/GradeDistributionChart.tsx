import React, { useMemo } from "react";
import { Activity, Player } from "@/types/player";
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getGradeColor } from "@/utils/gradeUtils";
import { useIsMobile } from "@/hooks/use-mobile";

interface GradeDistributionChartProps {
  activity: Activity;
  participatingPlayers: Player[];
}

export function GradeDistributionChart({ activity, participatingPlayers }: GradeDistributionChartProps) {
  const isMobile = useIsMobile();
  
  if (!participatingPlayers || participatingPlayers.length === 0) {
    return null;
  }
  
  // Calculate grade distribution among participating players
  const gradeDistribution = useMemo(() => {
    // Group players by grade
    const gradeGroups = participatingPlayers.reduce((acc, player) => {
      if (!player.grade) return acc;
      
      if (!acc[player.grade]) {
        acc[player.grade] = 0;
      }
      
      acc[player.grade]++;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to data format needed for recharts
    return Object.entries(gradeGroups)
      .map(([grade, count]) => ({ 
        name: grade, 
        value: count 
      }))
      .sort((a, b) => {
        // Sort by grade - prioritize A, then B, then C, then D
        const getGradeValue = (grade: string) => {
          switch(grade) {
            case 'A': return 1;
            case 'B': return 2;
            case 'C': return 3;
            case 'D': return 4;
            default: return 5;
          }
        };
        
        return getGradeValue(a.name) - getGradeValue(b.name);
      });
  }, [participatingPlayers]);
  
  return (
    <div className={`${isMobile ? 'mt-3 border-t pt-3' : 'mt-4 border-t pt-4'}`}>
      <h4 className={`${isMobile ? 'text-sm' : ''} font-medium mb-2`}>Nivåfördelning - Spelare</h4>
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-2' : 'grid-cols-2 sm:grid-cols-4 gap-3'}`}>
        {gradeDistribution.map((gradeData, index) => {
          const { name, value } = gradeData;
          const bgColor = getGradeColor(name);
          
          return (
            <div 
              key={name} 
              className={`rounded-md py-2 px-3 text-center ${bgColor}`}
            >
              <div className={`font-bold ${isMobile ? 'text-sm' : ''}`}>Nivå {name}</div>
              <div className={isMobile ? 'text-xs' : 'text-sm'}>{value} st</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

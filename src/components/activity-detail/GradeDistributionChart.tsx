
import React from "react";
import { Activity, Player } from "@/types/player";
import { GradePieChart } from "./match-result/GradePieChart";

interface GradeDistributionChartProps {
  activity: Activity;
  participatingPlayers: Player[];
}

export function GradeDistributionChart({ activity, participatingPlayers }: GradeDistributionChartProps) {
  if (!participatingPlayers || participatingPlayers.length === 0) {
    return null;
  }
  
  // We've moved the GradePieChart to the overview list item, so we'll use a different
  // visualization or information here in the detailed view
  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-sm font-medium mb-2">Nivåfördelning - Spelare</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {['A', 'B', 'C', 'D'].map(grade => {
          const count = participatingPlayers.filter(p => p.grade === grade).length;
          const percentage = participatingPlayers.length > 0 
            ? Math.round((count / participatingPlayers.length) * 100) 
            : 0;
          
          // Skip showing grades with 0 players
          if (count === 0) return null;
          
          // Map grades to colors
          const bgColor = grade === 'A' 
            ? 'bg-green-100 text-green-800' 
            : grade === 'B'
            ? 'bg-blue-100 text-blue-800'
            : grade === 'C'
            ? 'bg-amber-100 text-amber-800'
            : 'bg-red-100 text-red-800';
            
          return (
            <div 
              key={grade} 
              className={`rounded-md py-2 px-3 text-center ${bgColor}`}
            >
              <div className="font-bold">Nivå {grade}</div>
              <div className="text-sm">{count} st ({percentage}%)</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

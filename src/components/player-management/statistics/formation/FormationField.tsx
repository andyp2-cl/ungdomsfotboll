
import React from 'react';
import { getPositionColor } from './positionUtils';
import { FORMATIONS } from './formationData';
import { PlayerPosition } from '@/types/player';

interface FormationFieldProps {
  selectedFormation: string;
}

export function FormationField({ selectedFormation }: FormationFieldProps) {
  return (
    <div className="relative bg-green-800 rounded-md aspect-[4/3] mb-4">
      {FORMATIONS[selectedFormation as keyof typeof FORMATIONS]?.positions.map((pos, index) => (
        <div 
          key={index} 
          className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-white/90 text-sm font-medium border-2 border-white text-gray-900 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: `${(pos.col + 0.5) * 20}%`, 
            top: `${(pos.row + 0.5) * 25}%`,
            borderColor: getPositionColor(pos.position as PlayerPosition)
          }}
        >
          {pos.position}
        </div>
      ))}
    </div>
  );
}


import React, { useMemo } from 'react';
import { Player, Activity } from "@/types/player";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LabelList } from 'recharts';
import { getGradeColor } from '@/utils/gradeUtils';

interface PlayerAttendanceAnalyticsProps {
  players: Player[];
  activities: Activity[];
}

export function PlayerAttendanceAnalytics({ players, activities }: PlayerAttendanceAnalyticsProps) {
  // Calculate attendance rates for each player
  const attendanceData = useMemo(() => {
    return players
      .filter(player => !player.positions?.includes('TRÄNARE')) // Filter out trainers
      .map(player => {
        // Count activities the player is participating in
        const participatingCount = player.activities?.length || 0;
        
        // Calculate attendance percentage
        const attendanceRate = activities.length > 0 
          ? (participatingCount / activities.length) * 100 
          : 0;
        
        return {
          name: player.name,
          grade: player.grade,
          jersey: player.jerseyNumber || '',
          attendanceRate: Math.round(attendanceRate),
          activitiesCount: participatingCount,
          totalActivities: activities.length,
          fill: getGradeColor(player.grade)
        };
      })
      .sort((a, b) => b.attendanceRate - a.attendanceRate) // Sort by attendance rate
      .slice(0, 10); // Get top 10 players
  }, [players, activities]);

  return (
    <div className="h-[300px] mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={attendanceData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <XAxis 
            type="number" 
            domain={[0, 100]} 
            tickFormatter={(value) => `${value}%`}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            width={100}
            tickFormatter={(value) => {
              // Truncate long names
              return value.length > 12 ? value.substring(0, 12) + '...' : value;
            }}
          />
          <Tooltip
            formatter={(value, name, props) => {
              const data = props.payload;
              return [
                `${value}% (${data.activitiesCount}/${data.totalActivities})`,
                'Närvaro'
              ];
            }}
            contentStyle={{
              backgroundColor: 'white',
              borderRadius: '6px',
              padding: '8px 12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          />
          <Bar 
            dataKey="attendanceRate" 
            name="Närvaro" 
            radius={[0, 4, 4, 0]}
          >
            <LabelList 
              dataKey="attendanceRate" 
              position="right" 
              formatter={(value: number) => `${value}%`}
              style={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

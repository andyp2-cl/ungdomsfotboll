import React from 'react';
import { Player, Activity } from '@/types/player';
import { ResponsiveBar } from '@nivo/bar';
import { getGradeColor } from '@/utils/gradeUtils';

interface PlayerAttendanceAnalyticsProps {
  players: Player[];
  activities: Activity[];
}

// This fixes the jerseyNumber property reference in the component
export function PlayerAttendanceAnalytics({ players, activities }: PlayerAttendanceAnalyticsProps) {
  // Update the player data mapping
  const playerData = players.map(player => {
    // Calculate attendance rate for each player
    const playerActivities = activities.filter(a => 
      a.participants && a.participants.includes(player.id)
    );
    
    const attendanceRate = activities.length > 0
      ? (playerActivities.length / activities.length) * 100
      : 0;
    
    return {
      id: player.id,
      name: player.name,
      grade: player.grade || 'N/A',
      position: player.positions ? player.positions[0] || 'N/A' : 'N/A',
      jerseyNumber: player.jerseyNumber || '',
      attendanceRate: Math.round(attendanceRate),
      activityCount: playerActivities.length,
      fill: getGradeColor(player.grade),
    };
  });

  // Sort players by attendance rate
  const sortedPlayerData = [...playerData].sort((a, b) => b.attendanceRate - a.attendanceRate);

  return (
    <div style={{ height: '400px' }}>
      <ResponsiveBar
        data={sortedPlayerData}
        keys={['attendanceRate']}
        indexBy="name"
        margin={{ top: 50, right: 30, bottom: 50, left: 70 }}
        padding={0.3}
        colors={({ data }) => data.fill}
        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: -45,
          legend: 'Spelare',
          legendPosition: 'middle',
          legendOffset: 32
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: 'Närvaro (%)',
          legendPosition: 'middle',
          legendOffset: -60
        }}
        labelSkipWidth={12}
        labelSkipHeight={12}
        labelTextColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
        legends={[]}
        role="application"
        ariaLabel="Spelares närvaro i procent"
        barAriaLabel={d => `Närvaro för ${d.id}: ${d.value}%`}
      />
    </div>
  );
}

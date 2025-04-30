
import React from 'react';
import { Player, Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, Legend } from 'recharts';
import { getGradeColor } from '@/utils/gradeUtils';

interface AttendanceTabContentProps {
  players: Player[];
  activities: Activity[];
}

export function AttendanceTabContent({ players, activities }: AttendanceTabContentProps) {
  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const stats = [
      { name: '90-100%', value: 0, color: '#22c55e' },  // Green
      { name: '75-89%', value: 0, color: '#84cc16' },   // Light green
      { name: '50-74%', value: 0, color: '#eab308' },   // Yellow
      { name: '25-49%', value: 0, color: '#f97316' },   // Orange
      { name: '0-24%', value: 0, color: '#ef4444' }     // Red
    ];
    
    // Count players in each attendance range
    players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .forEach(player => {
        const playerActivities = player.activities?.length || 0;
        const attendanceRate = activities.length > 0
          ? (playerActivities / activities.length) * 100
          : 0;
        
        if (attendanceRate >= 90) stats[0].value++;
        else if (attendanceRate >= 75) stats[1].value++;
        else if (attendanceRate >= 50) stats[2].value++;
        else if (attendanceRate >= 25) stats[3].value++;
        else stats[4].value++;
      });
    
    return stats;
  }, [players, activities]);
  
  // Calculate attendance by grade
  const gradeAttendance = React.useMemo(() => {
    const gradeMap = new Map<string, { name: string, count: number, players: number, activities: number }>();
    
    // Initialize grades
    ['A', 'B', 'C', 'D'].forEach(grade => {
      gradeMap.set(grade, { name: grade, count: 0, players: 0, activities: 0 });
    });
    
    // Count players and activities by grade
    players.forEach(player => {
      if (player.positions?.includes("TRÄNARE")) return;
      
      const grade = player.grade;
      if (!gradeMap.has(grade)) return;
      
      const gradeData = gradeMap.get(grade)!;
      gradeData.players++;
      gradeData.activities += player.activities?.length || 0;
      
      gradeMap.set(grade, gradeData);
    });
    
    // Calculate average attendance rates
    return Array.from(gradeMap.values())
      .map(data => ({
        ...data,
        average: data.players > 0 
          ? Math.round((data.activities / (data.players * activities.length)) * 100) 
          : 0,
        color: getGradeColor(data.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [players, activities]);
  
  // Calculate top attendees (players with highest attendance)
  const topAttendees = React.useMemo(() => {
    return players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .map(player => {
        const attendance = player.activities?.length || 0;
        const rate = activities.length > 0
          ? Math.round((attendance / activities.length) * 100)
          : 0;
          
        return {
          id: player.id,
          name: player.name,
          grade: player.grade,
          attendance,
          rate,
          color: getGradeColor(player.grade)
        };
      })
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 10);
  }, [players, activities]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Närvarofördelning</CardTitle>
          <CardDescription>Andel spelare per närvarograd</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={attendanceStats}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {attendanceStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} spelare`, '']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Närvaro per nivå</CardTitle>
          <CardDescription>Genomsnittlig närvaro per spelargrad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={gradeAttendance}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => [`${value}%`, 'Närvaro']} />
                <Bar dataKey="average" name="Närvaro">
                  {gradeAttendance.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Topplista närvaro</CardTitle>
          <CardDescription>Spelare med högst närvaro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topAttendees}
                layout="vertical"
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                <YAxis dataKey="name" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value}%`, 'Närvaro']} />
                <Bar dataKey="rate" name="Närvarorate">
                  {topAttendees.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Player, Activity } from "@/types/player";

interface ParticipationDistributionChartProps {
  players: Player[];
  activities: Activity[];
}

export function ParticipationDistributionChart({ players, activities }: ParticipationDistributionChartProps) {
  // Group players by participation levels
  const participationGroups = React.useMemo(() => {
    const groups = [
      { name: '90-100%', value: 0, color: '#22c55e' },
      { name: '75-89%', value: 0, color: '#84cc16' },
      { name: '50-74%', value: 0, color: '#facc15' },
      { name: '25-49%', value: 0, color: '#fb923c' },
      { name: '0-24%', value: 0, color: '#ef4444' },
    ];
    
    players
      .filter(player => !player.positions?.includes("TRÄNARE"))
      .forEach(player => {
        const participatedActivities = activities.filter(activity => 
          activity.participants?.includes(player.id)
        ).length;
        
        const rate = activities.length > 0
          ? Math.round((participatedActivities / activities.length) * 100)
          : 0;
        
        if (rate >= 90) groups[0].value++;
        else if (rate >= 75) groups[1].value++;
        else if (rate >= 50) groups[2].value++;
        else if (rate >= 25) groups[3].value++;
        else groups[4].value++;
      });
    
    return groups;
  }, [activities, players]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Deltagandegrader</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={participationGroups}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {participationGroups.map((entry, index) => (
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
  );
}

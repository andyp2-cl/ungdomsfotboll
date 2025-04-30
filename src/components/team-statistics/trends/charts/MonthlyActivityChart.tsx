
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MonthlyActivityData } from '../utils/activityDataUtils';

interface MonthlyActivityChartProps {
  data: MonthlyActivityData[];
}

export const MonthlyActivityChart: React.FC<MonthlyActivityChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Aktiviteter per månad</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="matches" name="Matcher" fill="#8884d8" />
              <Bar dataKey="trainings" name="Träningar" fill="#82ca9d" />
              <Bar dataKey="cups" name="Cuper" fill="#ffc658" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

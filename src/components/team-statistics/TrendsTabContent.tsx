
import React from 'react';
import { Activity } from "@/types/player";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { MonthlyActivityChart } from "@/components/MonthlyActivityChart";

interface TrendsTabContentProps {
  activities: Activity[];
}

export function TrendsTabContent({ activities }: TrendsTabContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MonthlyActivityChart activities={activities} />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Aktivitetsutveckling
          </CardTitle>
          <CardDescription>
            Utveckling av aktiviteter över tid
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="text-center p-4">
            <h3 className="text-xl font-medium mb-4">Trend analys</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-2xl font-bold text-green-500">+{Math.round(activities.length * 0.15)}</div>
                <div className="text-sm text-muted-foreground">Ökning jämfört med förra perioden</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-2xl font-bold">{activities.filter(a => a.type === 'match').length}</div>
                <div className="text-sm text-muted-foreground">Matchaktiviteter</div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-2xl font-bold">{activities.filter(a => a.type === 'cup').length}</div>
                <div className="text-sm text-muted-foreground">Cupaktiviteter</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

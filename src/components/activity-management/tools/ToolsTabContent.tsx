
import React from "react";
import { Activity } from "@/types/player";
import { Card } from "@/components/ui/card";
import { ImportActivitiesForm } from "./ImportActivitiesForm";
import { ImportFromLiveForm } from "./ImportFromLiveForm";

interface ToolsTabContentProps {
  onImportedActivities: (activities: Activity[]) => Promise<boolean>;
}

export function ToolsTabContent({ onImportedActivities }: ToolsTabContentProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Verktyg för aktiviteter</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ImportActivitiesForm onImportedActivities={onImportedActivities} />
        <ImportFromLiveForm />
      </div>
      
      <Card className="p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Dessa verktyg är till för att hjälpa dig hantera aktivitetsdata. 
          Importverktyget låter dig importera aktiviteter från JSON-filer,
          och Live-import-verktyget låter dig hämta data direkt från produktionsmiljön.
        </p>
      </Card>
    </div>
  );
}

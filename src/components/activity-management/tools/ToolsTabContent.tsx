
import React from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseBackup, FileDown, FileUp, Globe } from "lucide-react";
import { ImportActivitiesForm } from "./ImportActivitiesForm";
import { ImportFromLiveForm } from "./ImportFromLiveForm";
import { BackupRestoreActions } from "@/components/backup-restore";

interface ToolsTabContentProps {
  onImportedActivities: (activities: Activity[]) => Promise<boolean>;
}

export function ToolsTabContent({ onImportedActivities }: ToolsTabContentProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Verktyg för aktiviteter</h2>
      
      <Tabs defaultValue="file">
        <TabsList className="mb-4">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Från fil
          </TabsTrigger>
          <TabsTrigger value="live" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Från Live-miljö
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file">
          <ImportActivitiesForm onImportedActivities={onImportedActivities} />
        </TabsContent>
        
        <TabsContent value="live">
          <ImportFromLiveForm onImportedActivities={onImportedActivities} />
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DatabaseBackup className="h-5 w-5" />
            Säkerhetskopiering
          </CardTitle>
          <CardDescription>
            Skapa eller återställ säkerhetskopior av alla aktiviteter och spelare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BackupRestoreActions />
        </CardContent>
      </Card>
    </div>
  );
}

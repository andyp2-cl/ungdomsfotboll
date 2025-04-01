
import React from "react";
import { Activity } from "@/types/player";
import { FileImport } from "@/components/file-import/FileImport";
import { BackupRestoreActions } from "@/components/backup-restore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DatabaseBackup } from "lucide-react";

interface ToolsTabContentProps {
  onImportedActivities: (importedActivities: Activity[]) => void;
  onMatchesScraped?: (newActivities: Activity[], clearExisting?: boolean) => void;
}

export function ToolsTabContent({
  onImportedActivities
}: ToolsTabContentProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
        <FileImport onActivitiesImported={onImportedActivities} />
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <DatabaseBackup className="h-5 w-5" />
            Säkerhetskopiering
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Här kan du skapa en säkerhetskopia av alla spelare och aktiviteter, eller återställa från en tidigare skapad säkerhetskopia.
          </p>
          <BackupRestoreActions />
        </CardContent>
      </Card>
    </div>
  );
}

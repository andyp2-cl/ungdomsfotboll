
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseBackup, FileDown, FileUp, Globe } from "lucide-react";
import { ImportActivitiesForm } from "./ImportActivitiesForm";
import { ImportFromLiveForm } from "./ImportFromLiveForm";
import { BackupRestoreActions } from "@/components/backup-restore";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ToolsTabContentProps {
  onImportedActivities: (activities: Activity[]) => Promise<boolean>;
}

export function ToolsTabContent({ onImportedActivities }: ToolsTabContentProps) {
  const [isLiveImportOpen, setIsLiveImportOpen] = useState(false);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">Verktyg för aktiviteter</h2>
      
      <div className="flex gap-4 flex-wrap">
        <Button 
          variant="outline" 
          onClick={() => setIsLiveImportOpen(true)}
          className="flex items-center gap-2"
        >
          <Globe className="h-4 w-4" />
          Importera från live-miljö
        </Button>
      </div>
      
      <Tabs defaultValue="file">
        <TabsList className="mb-4">
          <TabsTrigger value="file" className="flex items-center gap-2">
            <FileUp className="h-4 w-4" />
            Från fil
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="file">
          <ImportActivitiesForm onImportedActivities={onImportedActivities} />
        </TabsContent>
      </Tabs>
      
      {/* Live Import Dialog */}
      <Dialog open={isLiveImportOpen} onOpenChange={setIsLiveImportOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Importera från live-miljö
            </DialogTitle>
          </DialogHeader>
          <ImportFromLiveForm 
            onImportedActivities={(activities) => {
              onImportedActivities(activities);
              setIsLiveImportOpen(false);
              return Promise.resolve(true);
            }} 
          />
        </DialogContent>
      </Dialog>
      
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

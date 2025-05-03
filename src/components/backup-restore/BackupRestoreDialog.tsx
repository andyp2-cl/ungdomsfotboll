
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatabaseBackup, Save, RotateCcw } from "lucide-react";
import { BackupPanel } from "./BackupPanel";
import { RestorePanel } from "./RestorePanel";

interface BackupRestoreDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "backup" | "restore";
}

export function BackupRestoreDialog({ 
  isOpen, 
  onOpenChange,
  defaultTab = "backup" 
}: BackupRestoreDialogProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-primary" />
            Säkerhetskopiering
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup" className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Säkerhetskopia
            </TabsTrigger>
            <TabsTrigger value="restore" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Återställ
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="backup">
            <BackupPanel onSuccess={() => onOpenChange(false)} />
          </TabsContent>
          
          <TabsContent value="restore">
            <RestorePanel onSuccess={() => onOpenChange(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

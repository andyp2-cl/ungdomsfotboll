
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useBackupRestore } from "@/utils/storage/backup";
import { RestoreDialog } from "./restore-dialog";

export function RestoreButton() {
  const { getLastBackupInfo } = useBackupRestore();
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{timestamp: string, playerCount: number, activityCount: number} | null>(
    getLastBackupInfo()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        disabled={!backupInfo || isRestoring}
        onClick={handleOpenDialog}
      >
        {isRestoring ? <Spinner className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
        Återställ
      </Button>
      
      <RestoreDialog 
        backupInfo={backupInfo}
        isRestoring={isRestoring}
        setIsRestoring={setIsRestoring}
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
      />
    </>
  );
}


import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBackupRestore } from "@/utils/storage/backup";
import { Save, RotateCcw, Clock } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";

export function BackupRestoreActions() {
  const { createBackup, restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  
  const backupInfo = getLastBackupInfo();
  const formattedBackupDate = backupInfo?.timestamp 
    ? format(new Date(backupInfo.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : null;
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await createBackup();
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleRestore = async () => {
    setIsRestoring(true);
    try {
      await restoreBackup();
      // Force reload the page to reflect changes
      window.location.reload();
    } finally {
      setIsRestoring(false);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="flex items-center gap-2"
        onClick={handleBackup}
        disabled={isBackingUp || isRestoring}
      >
        {isBackingUp ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        Spara data
      </Button>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            disabled={!backupInfo || isBackingUp || isRestoring}
          >
            {isRestoring ? <Spinner className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            Återställ
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Återställ data</AlertDialogTitle>
            <AlertDialogDescription>
              Detta kommer att återställa alla spelare och aktiviteter till den senaste säkerhetskopian.
              {formattedBackupDate && (
                <div className="mt-2 font-medium">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Säkerhetskopia från: {formattedBackupDate}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Innehåller {backupInfo?.playerCount} spelare och {backupInfo?.activityCount} aktiviteter.
                  </div>
                </div>
              )}
              <p className="mt-4 font-medium text-destructive">
                Varning: Alla ändringar sedan senaste säkerhetskopian kommer att förloras.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Avbryt</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>Återställ data</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

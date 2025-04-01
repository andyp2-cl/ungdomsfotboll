
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useBackupRestore } from "@/utils/storage/backup";
import { Save, RotateCcw, Clock, CheckCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";

export function BackupRestoreActions() {
  const { toast } = useToast();
  const { createBackup, restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{timestamp: string, playerCount: number, activityCount: number} | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Get backup info on component mount and after operations
  useEffect(() => {
    const info = getLastBackupInfo();
    setBackupInfo(info);
  }, [isBackingUp, isRestoring]); // Re-check after operations
  
  const formattedBackupDate = backupInfo?.timestamp 
    ? format(new Date(backupInfo.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : null;
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await createBackup();
      // Update the backup info after creating a new backup
      const newBackupInfo = getLastBackupInfo();
      setBackupInfo(newBackupInfo);
      
      if (!newBackupInfo || newBackupInfo.playerCount === 0 && newBackupInfo.activityCount === 0) {
        toast({
          title: "Varning",
          description: "Säkerhetskopian verkar vara tom. Ingen data hittades för backup.",
          variant: "destructive"
        });
        return;
      }
      
      // Show success message
      toast({
        title: "Data sparad",
        description: `En säkerhetskopia har skapats med ${newBackupInfo.playerCount} spelare och ${newBackupInfo.activityCount} aktiviteter.`,
      });
      
      // Show success icon for 2 seconds
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      toast({
        title: "Fel",
        description: "Kunde inte skapa säkerhetskopia. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleRestore = async () => {
    // Verify if backup exists and has data
    const info = getLastBackupInfo();
    if (!info || (info.playerCount === 0 && info.activityCount === 0)) {
      toast({
        title: "Återställning misslyckades",
        description: "Säkerhetskopian är tom eller saknas. Skapa en ny säkerhetskopia först.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRestoring(true);
    try {
      toast({
        title: "Återställer data",
        description: "Återställer data från säkerhetskopia. Detta kan ta en stund...",
      });
      
      const success = await restoreBackup();
      
      if (success) {
        toast({
          title: "Data återställd",
          description: `Data har återställts från säkerhetskopian skapad ${formattedBackupDate} (${info.playerCount} spelare, ${info.activityCount} aktiviteter).`,
        });
        // Force reload the page to reflect changes
        window.location.reload();
      } else {
        toast({
          title: "Återställning misslyckades",
          description: "Kunde inte återställa data. Säkerhetskopian kan vara skadad eller ogiltig.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error in restore:", error);
      toast({
        title: "Återställning misslyckades",
        description: `Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`,
        variant: "destructive"
      });
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
        {isBackingUp ? <Spinner className="h-4 w-4" /> : 
          showSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
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
              {formattedBackupDate ? (
                <div className="mt-2 font-medium">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Säkerhetskopia från: {formattedBackupDate}
                  </div>
                  <div className="text-muted-foreground mt-1">
                    Innehåller {backupInfo?.playerCount} spelare och {backupInfo?.activityCount} aktiviteter.
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 font-medium text-amber-500">
                  <AlertTriangle className="h-4 w-4" />
                  Ingen säkerhetskopia hittades eller så saknar den data.
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

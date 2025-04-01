
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useBackupRestore } from "@/utils/storage/backup";
import { validateBackupData } from "@/utils/storage/backup/utils";

export function BackupButton() {
  const { toast } = useToast();
  const { createBackup, getLastBackupInfo } = useBackupRestore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await createBackup();
      // Update the backup info after creating a new backup
      const newBackupInfo = getLastBackupInfo();
      
      if (!newBackupInfo || (newBackupInfo.playerCount === 0 && newBackupInfo.activityCount === 0)) {
        toast({
          title: "Varning",
          description: "Säkerhetskopian verkar vara tom. Ingen data hittades för backup.",
          variant: "destructive"
        });
        return;
      }
      
      // Validate the backup data
      const backupData = localStorage.getItem('hassleholmsif_backup');
      if (backupData) {
        try {
          const parsed = JSON.parse(backupData);
          const isValid = validateBackupData(parsed);
          
          if (!isValid) {
            toast({
              title: "Varning",
              description: "Säkerhetskopian kan vara ogiltig. Se konsolen för detaljer.",
              variant: "destructive"
            });
            return;
          }
        } catch (error) {
          console.error("Error validating backup data:", error);
          toast({
            title: "Varning",
            description: "Ett fel uppstod när säkerhetskopian validerades.",
            variant: "destructive"
          });
          return;
        }
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
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="flex items-center gap-2"
      onClick={handleBackup}
      disabled={isBackingUp}
    >
      {isBackingUp ? <Spinner className="h-4 w-4" /> : 
        showSuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Save className="h-4 w-4" />}
      Spara data
    </Button>
  );
}

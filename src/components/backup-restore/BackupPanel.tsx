
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Save, CheckCircle, Download } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useBackupRestore, BackupInfo } from "@/utils/storage/backup";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface BackupPanelProps {
  onSuccess?: () => void;
}

export function BackupPanel({ onSuccess }: BackupPanelProps) {
  const { createBackup, getLastBackupInfo } = useBackupRestore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(getLastBackupInfo());
  
  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    setShowSuccess(false);
    
    try {
      await createBackup();
      const newBackupInfo = getLastBackupInfo();
      setBackupInfo(newBackupInfo);
      
      toast.success(`Säkerhetskopia har skapats med ${newBackupInfo?.playerCount || 0} spelare och ${newBackupInfo?.activityCount || 0} aktiviteter`);
      setShowSuccess(true);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast.error("Kunde inte skapa säkerhetskopia");
    } finally {
      setIsBackingUp(false);
    }
  };
  
  const handleDownloadBackup = () => {
    const backupData = localStorage.getItem('hassleholmsif_backup');
    if (!backupData) {
      toast.error("Ingen säkerhetskopia att ladda ner");
      return;
    }
    
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    const date = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = `hassleholmsif_backup_${date}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Säkerhetskopian har laddats ner");
  };
  
  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground">
        Skapa en säkerhetskopia av alla spelare och aktiviteter som du kan återställa senare.
      </p>
      
      {backupInfo && (
        <Card className="p-4 bg-muted/40">
          <div className="text-sm">
            <p><strong>Senaste säkerhetskopia:</strong></p>
            <p>Datum: {new Date(backupInfo.timestamp).toLocaleDateString()}</p>
            <p>Tid: {new Date(backupInfo.timestamp).toLocaleTimeString()}</p>
            <p>({formatDistanceToNow(new Date(backupInfo.timestamp), { addSuffix: true, locale: sv })})</p>
            <p>Spelare: {backupInfo.playerCount}</p>
            <p>Aktiviteter: {backupInfo.activityCount}</p>
          </div>
        </Card>
      )}
      
      <div className="flex flex-col space-y-2">
        <Button 
          onClick={handleCreateBackup} 
          disabled={isBackingUp}
          className="w-full"
        >
          {isBackingUp ? (
            <>
              <Spinner className="mr-2 h-4 w-4" /> Skapar säkerhetskopia...
            </>
          ) : showSuccess ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Säkerhetskopia skapad
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Skapa säkerhetskopia
            </>
          )}
        </Button>
        
        {backupInfo && (
          <Button 
            variant="outline" 
            onClick={handleDownloadBackup}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" /> Ladda ner säkerhetskopia
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground italic mt-4">
        Tips: Ladda ner säkerhetskopian till din dator så du kan återställa den i en annan miljö eller vid senare tillfälle.
      </p>
    </div>
  );
}

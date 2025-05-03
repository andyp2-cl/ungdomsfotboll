
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useBackupRestore } from "@/utils/storage/backup";
import { validateBackupData } from "@/utils/storage/backup/utils";
import { format } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, AlertTriangle, Lock, DatabaseBackup } from "lucide-react";
import { toast } from "sonner";

interface RestoreDialogProps {
  backupInfo: {timestamp: string, playerCount: number, activityCount: number} | null;
  isRestoring: boolean;
  setIsRestoring: (value: boolean) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

const PASSWORD = "tommieannatedandreas"; // The password for restore functionality

export function RestoreDialog({ backupInfo, isRestoring, setIsRestoring, isOpen, setIsOpen }: RestoreDialogProps) {
  const { toast: uiToast } = useToast();
  const { restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDebug, setShowDebug] = useState(false);
  
  const formattedBackupDate = backupInfo?.timestamp 
    ? format(new Date(backupInfo.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : null;
    
  const validatePassword = () => {
    if (password !== PASSWORD) {
      setPasswordError("Felaktigt lösenord. Försök igen.");
      return false;
    }
    setPasswordError("");
    return true;
  };
  
  const handleRestore = async () => {
    // First validate the password
    if (!validatePassword()) {
      return;
    }
    
    // Verify if backup exists and has data
    const backupData = localStorage.getItem('hassleholmsif_backup');
    const info = getLastBackupInfo();
    
    if (!backupData || !info || (info.playerCount === 0 && info.activityCount === 0)) {
      uiToast({
        title: "Återställning misslyckades",
        description: "Säkerhetskopian är tom eller saknas. Skapa en ny säkerhetskopia först.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate backup data
    try {
      const parsed = JSON.parse(backupData);
      const isValid = validateBackupData(parsed);
      
      if (!isValid) {
        uiToast({
          title: "Återställning misslyckades",
          description: "Säkerhetskopian är ogiltig eller skadad. Skapa en ny säkerhetskopia.",
          variant: "destructive"
        });
        return;
      }
      
      // Show debugging info about match count if requested
      if (showDebug) {
        const matchCount = parsed.activities.filter(a => a.type === 'match').length;
        toast.info(`Säkerhetskopian innehåller ${matchCount} matcher`);
      }
    } catch (error) {
      console.error("Error validating backup data:", error);
      uiToast({
        title: "Återställning misslyckades",
        description: "Kunde inte tolka säkerhetskopian. Skapa en ny säkerhetskopia först.",
        variant: "destructive"
      });
      return;
    }
    
    setIsRestoring(true);
    try {
      toast({
        title: "Återställer data",
        description: "Återställer data från säkerhetskopia. Detta kan ta en stund...",
        duration: 10000
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
          description: "Kunde inte återställa data. Se konsolen för mer information.",
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
      // Reset password field after restore attempt
      setPassword("");
      // Close the dialog
      setIsOpen(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-primary" />
            Återställ data
          </AlertDialogTitle>
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
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="restore-password" className="font-medium">Ange lösenord för att fortsätta:</Label>
              </div>
              <Input 
                id="restore-password"
                type="password"
                placeholder="Lösenord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={passwordError ? "border-red-500" : ""}
              />
              {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}
            </div>
            
            <div className="mt-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="debug-mode" 
                  checked={showDebug} 
                  onChange={() => setShowDebug(!showDebug)}
                  className="accent-primary h-4 w-4"
                />
                <label htmlFor="debug-mode" className="text-sm text-muted-foreground cursor-pointer">
                  Visa detaljerad information vid återställning
                </label>
              </div>
            </div>
            
            <p className="mt-4 font-medium text-destructive">
              Varning: Alla ändringar sedan senaste säkerhetskopian kommer att förloras.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => {
            setPassword("");
            setPasswordError("");
          }}>Avbryt</AlertDialogCancel>
          <AlertDialogAction onClick={handleRestore}>Återställ data</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

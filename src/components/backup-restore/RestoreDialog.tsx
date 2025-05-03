
import React, { useState, useEffect } from "react";
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

// The password for restore functionality
const PASSWORD = "tommieannatedandreas"; 

export function RestoreDialog({ backupInfo, isRestoring, setIsRestoring, isOpen, setIsOpen }: RestoreDialogProps) {
  const { toast: uiToast } = useToast();
  const { restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDebug, setShowDebug] = useState(true); // Debug mode enabled by default
  const [showRaw, setShowRaw] = useState(false);
  const [rawBackupData, setRawBackupData] = useState<any>(null);
  
  const formattedBackupDate = backupInfo?.timestamp 
    ? format(new Date(backupInfo.timestamp), 'yyyy-MM-dd HH:mm:ss')
    : null;
  
  // Load raw backup data for advanced debugging
  useEffect(() => {
    if (isOpen && showRaw) {
      try {
        const backupString = localStorage.getItem('hassleholmsif_backup');
        if (backupString) {
          const parsedData = JSON.parse(backupString);
          setRawBackupData(parsedData);
        }
      } catch (error) {
        console.error("Failed to load raw backup data:", error);
      }
    }
  }, [isOpen, showRaw]);
    
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
      toast.error("Återställning misslyckades", {
        description: "Säkerhetskopian är tom eller saknas. Skapa en ny säkerhetskopia först."
      });
      return;
    }
    
    // Validate backup data
    try {
      const parsed = JSON.parse(backupData);
      const isValid = validateBackupData(parsed);
      
      if (!isValid) {
        toast.error("Återställning misslyckades", {
          description: "Säkerhetskopian är ogiltig eller skadad. Skapa en ny säkerhetskopia."
        });
        return;
      }
      
      // Show debugging info about match count if requested
      if (showDebug) {
        const matchCount = parsed.activities.filter((a: any) => a.type === 'match').length;
        toast.info(`Säkerhetskopian innehåller ${matchCount} matcher och ${parsed.players.length} spelare`);
      }
    } catch (error) {
      console.error("Error validating backup data:", error);
      toast.error("Återställning misslyckades", {
        description: "Kunde inte tolka säkerhetskopian. Skapa en ny säkerhetskopia först."
      });
      return;
    }
    
    setIsRestoring(true);
    try {
      toast.message("Återställer data", {
        description: "Återställer data från säkerhetskopia. Detta kan ta en stund...",
        duration: 10000
      });
      
      const success = await restoreBackup();
      
      if (success) {
        toast.success("Data återställd", {
          description: `Data har återställts från säkerhetskopian skapad ${formattedBackupDate} (${info.playerCount} spelare, ${info.activityCount} aktiviteter).`,
        });
        // Force reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Återställning misslyckades", {
          description: "Kunde inte återställa data. Se konsolen för mer information."
        });
      }
    } catch (error) {
      console.error("Error in restore:", error);
      toast.error("Återställning misslyckades", {
        description: `Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`
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
            <p>Detta kommer att återställa alla spelare och aktiviteter till den senaste säkerhetskopian.</p>
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
              <div className="flex items-center gap-2 mt-1">
                <input 
                  type="checkbox" 
                  id="raw-mode" 
                  checked={showRaw} 
                  onChange={() => setShowRaw(!showRaw)}
                  className="accent-primary h-4 w-4"
                />
                <label htmlFor="raw-mode" className="text-sm text-muted-foreground cursor-pointer">
                  Visa rå data från säkerhetskopia
                </label>
              </div>
            </div>
            
            {showRaw && rawBackupData && (
              <div className="mt-4 text-xs bg-gray-100 p-2 rounded-md max-h-36 overflow-y-auto">
                <p>Players: {rawBackupData.players?.length || 0}</p>
                <p>Activities: {rawBackupData.activities?.length || 0}</p>
                <p>Matches: {rawBackupData.activities?.filter((a: any) => a.type === 'match').length || 0}</p>
                <p>Timestamp: {rawBackupData.timestamp}</p>
              </div>
            )}
            
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
          <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
            {isRestoring ? "Återställer..." : "Återställ data"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

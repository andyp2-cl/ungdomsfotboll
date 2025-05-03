
import { useState, useEffect } from 'react';
import { useBackupRestore } from '@/utils/storage/backup';
import { toast } from 'sonner';
import { validateBackupData } from '@/utils/storage/backup/utils';
import { BackupInfo } from './types';

// The password for restore functionality
const PASSWORD = "tommieannatedandreas"; 

export function useRestoreDialog(
  backupInfo: BackupInfo | null,
  setIsRestoring: (value: boolean) => void,
  setActiveTab: (value: string) => void
) {
  const { restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showDebug, setShowDebug] = useState(true); // Debug mode enabled by default
  const [showRaw, setShowRaw] = useState(false);
  const [rawBackupData, setRawBackupData] = useState<any>(null);
  
  // Load raw backup data for advanced debugging
  useEffect(() => {
    if (showRaw) {
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
  }, [showRaw]);
    
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
        description: "Återställer data från säkerhetskopian. Detta kan ta en stund...",
        duration: 10000
      });
      
      const success = await restoreBackup();
      
      if (success) {
        const formattedBackupDate = backupInfo?.timestamp 
          ? new Date(backupInfo.timestamp).toLocaleString()
          : 'unknown date';
          
        toast.success("Data återställd", {
          description: `Data har återställts från säkerhetskopian skapad ${formattedBackupDate} (${info.playerCount} spelare, ${info.activityCount} aktiviteter).`,
        });
        // Force reload the page to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error("Återställning misslyckades", {
          description: "Kunde inte återställa data. Öppna fliken Diagnostik för att felsöka problemet."
        });
        setActiveTab("diagnostic");
      }
    } catch (error) {
      console.error("Error in restore:", error);
      toast.error("Återställning misslyckades", {
        description: `Ett fel uppstod: ${error instanceof Error ? error.message : 'Okänt fel'}`
      });
      setActiveTab("diagnostic");
    } finally {
      setIsRestoring(false);
      // Reset password field after restore attempt
      setPassword("");
    }
  };
  
  return {
    password,
    setPassword,
    passwordError,
    setPasswordError,
    showDebug,
    setShowDebug,
    showRaw,
    setShowRaw,
    rawBackupData,
    validatePassword,
    handleRestore
  };
}

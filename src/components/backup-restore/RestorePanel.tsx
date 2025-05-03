
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, RotateCcw } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useBackupRestore, BackupInfo } from "@/utils/storage/backup";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";

interface RestorePanelProps {
  onSuccess?: () => void;
}

export function RestorePanel({ onSuccess }: RestorePanelProps) {
  const { restoreBackup, getLastBackupInfo } = useBackupRestore();
  const [isRestoring, setIsRestoring] = useState(false);
  const [uploadedBackup, setUploadedBackup] = useState<{
    data: string;
    info?: BackupInfo;
  } | null>(null);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      try {
        const parsedData = JSON.parse(content);
        
        // Basic validation
        if (!parsedData.players || !parsedData.activities || !parsedData.timestamp) {
          toast.error("Ogiltig säkerhetskopieringsfil");
          return;
        }
        
        const backupInfo: BackupInfo = {
          timestamp: parsedData.timestamp,
          playerCount: parsedData.players.length,
          activityCount: parsedData.activities.length
        };
        
        setUploadedBackup({
          data: content,
          info: backupInfo
        });
        
        toast.success("Fil laddad, redo att återställa");
      } catch (error) {
        console.error("Error parsing backup file:", error);
        toast.error("Kunde inte läsa säkerhetskopian. Är det en giltig JSON-fil?");
      }
    };
    
    reader.readAsText(file);
  };
  
  const validatePassword = (): boolean => {
    const correctPassword = "tommieannatedandreas";
    if (password !== correctPassword) {
      setPasswordError("Felaktigt lösenord");
      return false;
    }
    setPasswordError("");
    return true;
  };
  
  const handleRestoreFromUpload = async () => {
    if (!validatePassword() || !uploadedBackup) return;
    
    setIsRestoring(true);
    try {
      // Store the uploaded data in localStorage
      localStorage.setItem('hassleholmsif_backup', uploadedBackup.data);
      
      // Then restore from it
      await restoreBackup();
      
      toast.success("Data har återställts från den uppladdade säkerhetskopian");
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form after successful restore
      setPassword("");
      setUploadedBackup(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error restoring from uploaded backup:", error);
      toast.error("Kunde inte återställa från den uppladdade säkerhetskopian");
    } finally {
      setIsRestoring(false);
    }
  };
  
  const handleRestoreFromLocal = async () => {
    if (!validatePassword()) return;
    
    setIsRestoring(true);
    try {
      await restoreBackup();
      toast.success("Data har återställts från senaste säkerhetskopian");
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset password after successful restore
      setPassword("");
    } catch (error) {
      console.error("Error restoring from local backup:", error);
      toast.error("Kunde inte återställa från säkerhetskopian");
    } finally {
      setIsRestoring(false);
    }
  };
  
  // Get info about the local backup
  const localBackupInfo = getLastBackupInfo();
  
  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-muted-foreground mb-4">
        Återställ från en tidigare skapad säkerhetskopia genom att ladda upp en fil eller använda den senaste lokala kopian.
      </p>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Ladda upp säkerhetskopia</h3>
          <Input 
            ref={fileInputRef}
            type="file" 
            accept=".json" 
            onChange={handleFileUpload} 
            disabled={isRestoring}
          />
        </div>
        
        {uploadedBackup?.info && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription>
              <p><strong>Uppladdad säkerhetskopia:</strong></p>
              <p>Datum: {new Date(uploadedBackup.info.timestamp).toLocaleDateString()}</p>
              <p>Spelare: {uploadedBackup.info.playerCount}</p>
              <p>Aktiviteter: {uploadedBackup.info.activityCount}</p>
            </AlertDescription>
          </Alert>
        )}
        
        {localBackupInfo && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-800">
            <AlertDescription>
              <p><strong>Lokal säkerhetskopia:</strong></p>
              <p>Datum: {new Date(localBackupInfo.timestamp).toLocaleDateString()}</p>
              <p>({formatDistanceToNow(new Date(localBackupInfo.timestamp), { addSuffix: true, locale: sv })})</p>
              <p>Spelare: {localBackupInfo.playerCount}</p>
              <p>Aktiviteter: {localBackupInfo.activityCount}</p>
            </AlertDescription>
          </Alert>
        )}
        
        <div>
          <h3 className="font-medium mb-2">Lösenord för återställning</h3>
          <Input
            type="password"
            placeholder="Lösenord för återställning"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={passwordError ? "border-red-500" : ""}
          />
          {passwordError && (
            <p className="text-sm text-red-500 mt-1">{passwordError}</p>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {uploadedBackup && (
            <Button 
              onClick={handleRestoreFromUpload} 
              disabled={isRestoring || !uploadedBackup}
              className="w-full"
            >
              {isRestoring ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Återställer...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Återställ från uppladdad fil
                </>
              )}
            </Button>
          )}
          
          {localBackupInfo && (
            <Button 
              onClick={handleRestoreFromLocal} 
              disabled={isRestoring}
              className="w-full"
              variant={uploadedBackup ? "outline" : "default"}
            >
              {isRestoring ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Återställer...
                </>
              ) : (
                <>
                  <RotateCcw className="mr-2 h-4 w-4" /> Återställ från lokal säkerhetskopia
                </>
              )}
            </Button>
          )}
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground italic">
        Tips: Lösenordet är samma i både dev- och live-miljön.
      </p>
    </div>
  );
}

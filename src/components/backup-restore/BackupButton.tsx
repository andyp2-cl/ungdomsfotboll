
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, CheckCircle, AlertTriangle, Shield } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { useBackupRestore } from "@/utils/storage/backup";
import { validateBackupData } from "@/utils/storage/backup/utils";
import { toast } from "sonner";
import { performBackup } from "@/utils/storage/backup/autoBackup";

export function BackupButton() {
  const { toast } = useToast();
  const { createBackup, getLastBackupInfo } = useBackupRestore();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [backupInfo, setBackupInfo] = useState<{timestamp: string, playerCount: number, activityCount: number} | null>(null);

  // Get last backup info on mount
  useEffect(() => {
    const lastBackupInfo = getLastBackupInfo();
    setBackupInfo(lastBackupInfo);
    
    // Check backup age
    if (lastBackupInfo) {
      const backupTime = new Date(lastBackupInfo.timestamp).getTime();
      const now = Date.now();
      const hoursSinceBackup = (now - backupTime) / (1000 * 60 * 60);
      
      // If backup is more than 2 hours old, suggest a new backup
      if (hoursSinceBackup > 2) {
        console.log(`Last backup is ${hoursSinceBackup.toFixed(1)} hours old. Suggesting new backup.`);
      }
    }
  }, [getLastBackupInfo]);
  
  // Function to check backup health - returns a status indicator
  const checkBackupHealth = () => {
    if (!backupInfo) return "none"; // No backup
    
    const backupTime = new Date(backupInfo.timestamp).getTime();
    const now = Date.now();
    const hoursSinceBackup = (now - backupTime) / (1000 * 60 * 60);
    
    if (hoursSinceBackup < 1) return "fresh"; // Less than 1 hour old
    if (hoursSinceBackup < 6) return "good"; // Less than 6 hours old
    if (hoursSinceBackup < 24) return "aging"; // Less than 24 hours old
    return "old"; // More than 24 hours old
  };
  
  const backupHealth = checkBackupHealth();
  
  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      // Use the shared backup function
      const success = await performBackup();
      
      if (success) {
        // Update the backup info
        const newBackupInfo = getLastBackupInfo();
        setBackupInfo(newBackupInfo);
        
        // Show success icon for 2 seconds
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } catch (error) {
      console.error("Error creating backup:", error);
      toast({
        title: "Fel",
        description: "Kunde inte skapa säkerhetskopia. Försök igen.",
        variant: "destructive"
      });
    } finally {
      setIsBackingUp(false);
    }
  };
  
  // Helper to format the button style based on backup health
  const getButtonStyle = () => {
    switch(backupHealth) {
      case "none":
        return "border-red-300 text-red-700 hover:bg-red-50";
      case "old":
        return "border-amber-300 text-amber-700 hover:bg-amber-50";
      case "aging":
        return "border-yellow-300 text-yellow-700 hover:bg-yellow-50"; 
      case "good":
        return "border-green-200 text-green-700 hover:bg-green-50";
      case "fresh":
        return "border-green-300 text-green-700 hover:bg-green-50";
      default:
        return "";
    }
  };
  
  // Helper to get the appropriate icon
  const getIcon = () => {
    if (isBackingUp) return <Spinner className="h-4 w-4" />;
    if (showSuccess) return <CheckCircle className="h-4 w-4 text-green-500" />;
    
    switch(backupHealth) {
      case "none":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "old":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "aging":
        return <Shield className="h-4 w-4 text-yellow-500" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };
  
  // Format time since last backup
  const formatTimeSinceBackup = () => {
    if (!backupInfo) return "Ingen säkerhetskopia";
    
    const backupTime = new Date(backupInfo.timestamp).getTime();
    const now = Date.now();
    const minutesSinceBackup = (now - backupTime) / (1000 * 60);
    
    if (minutesSinceBackup < 1) return "Just nu";
    if (minutesSinceBackup < 60) return `${Math.floor(minutesSinceBackup)} min sedan`;
    
    const hoursSinceBackup = minutesSinceBackup / 60;
    if (hoursSinceBackup < 24) return `${Math.floor(hoursSinceBackup)} tim sedan`;
    
    const daysSinceBackup = hoursSinceBackup / 24;
    return `${Math.floor(daysSinceBackup)} dagar sedan`;
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className={`flex items-center gap-2 ${getButtonStyle()}`}
      onClick={handleBackup}
      disabled={isBackingUp}
      title={backupInfo ? 
        `Senaste säkerhetskopia: ${new Date(backupInfo.timestamp).toLocaleString()}. ${backupInfo.playerCount} spelare, ${backupInfo.activityCount} aktiviteter` : 
        "Ingen säkerhetskopia. Klicka för att skapa en ny."}
    >
      {getIcon()}
      <span className="hidden sm:inline">
        {backupInfo ? formatTimeSinceBackup() : "Spara data"}
      </span>
    </Button>
  );
}

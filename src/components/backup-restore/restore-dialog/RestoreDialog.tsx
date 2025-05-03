
import React, { useState } from "react";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DatabaseBackup } from "lucide-react";
import { RestoreTabContent } from "./RestoreTabContent";
import { DiagnosticTabContent } from "./DiagnosticTabContent";
import { useRestoreDialog } from "./useRestoreDialog";
import { RestoreDialogProps } from "./types";

export function RestoreDialog({ 
  backupInfo, 
  isRestoring, 
  setIsRestoring, 
  isOpen, 
  setIsOpen 
}: RestoreDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("restore");
  
  const {
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
  } = useRestoreDialog(backupInfo, setIsRestoring, setActiveTab);
  
  const handleCancel = () => {
    setPassword("");
    setPasswordError("");
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-primary" />
            Återställ data
          </AlertDialogTitle>
          <AlertDialogDescription>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="restore">Återställ</TabsTrigger>
                <TabsTrigger value="diagnostic">Diagnostik</TabsTrigger>
              </TabsList>
              
              <TabsContent value="restore">
                <RestoreTabContent
                  backupInfo={backupInfo}
                  isRestoring={isRestoring}
                  password={password}
                  setPassword={setPassword}
                  passwordError={passwordError}
                  showDebug={showDebug}
                  setShowDebug={setShowDebug}
                  showRaw={showRaw}
                  setShowRaw={setShowRaw}
                  rawBackupData={rawBackupData}
                  validatePassword={validatePassword}
                  handleRestore={handleRestore}
                  onCancel={handleCancel}
                />
              </TabsContent>
              
              <TabsContent value="diagnostic">
                <DiagnosticTabContent onCancel={handleCancel} />
              </TabsContent>
            </Tabs>
          </AlertDialogDescription>
        </AlertDialogHeader>
      </AlertDialogContent>
    </AlertDialog>
  );
}

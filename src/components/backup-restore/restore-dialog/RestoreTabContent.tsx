
import React from 'react';
import { AlertDialogAction, AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { RestoreForm } from './RestoreForm';
import { BackupInfo } from './types';

interface RestoreTabContentProps {
  backupInfo: BackupInfo | null;
  isRestoring: boolean;
  password: string;
  setPassword: (value: string) => void;
  passwordError: string;
  showDebug: boolean;
  setShowDebug: (value: boolean) => void;
  showRaw: boolean;
  setShowRaw: (value: boolean) => void;
  rawBackupData: any;
  validatePassword: () => boolean;
  handleRestore: () => Promise<void>;
  onCancel: () => void;
}

export function RestoreTabContent({
  backupInfo,
  isRestoring,
  password,
  setPassword,
  passwordError,
  showDebug,
  setShowDebug,
  showRaw,
  setShowRaw,
  rawBackupData,
  validatePassword,
  handleRestore,
  onCancel
}: RestoreTabContentProps) {
  return (
    <>
      <RestoreForm
        backupInfo={backupInfo}
        password={password}
        setPassword={setPassword}
        passwordError={passwordError}
        showDebug={showDebug}
        setShowDebug={setShowDebug}
        showRaw={showRaw}
        setShowRaw={setShowRaw}
        rawBackupData={rawBackupData}
        validatePassword={validatePassword}
      />
      
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Avbryt</AlertDialogCancel>
        <AlertDialogAction onClick={handleRestore} disabled={isRestoring}>
          {isRestoring ? "Återställer..." : "Återställ data"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </>
  );
}

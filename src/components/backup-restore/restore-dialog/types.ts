
export interface BackupInfo {
  timestamp: string;
  playerCount: number;
  activityCount: number;
}

export interface RestoreDialogProps {
  backupInfo: BackupInfo | null;
  isRestoring: boolean;
  setIsRestoring: (value: boolean) => void;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
}

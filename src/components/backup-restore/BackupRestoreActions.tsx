
import React from "react";
import { BackupButton } from "./BackupButton";
import { RestoreButton } from "./RestoreButton";
import { BackupTips } from "./BackupTips";

export function BackupRestoreActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BackupButton />
        <RestoreButton />
      </div>
      
      <BackupTips />
    </div>
  );
}

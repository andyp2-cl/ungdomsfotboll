
import React from "react";
import { Button } from "@/components/ui/button";
import { BackupButton } from "./BackupButton";
import { RestoreButton } from "./RestoreButton";
import { BackupTips } from "./BackupTips";

export function BackupRestoreActions() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <BackupButton />
        <RestoreButton />
      </div>
      <BackupTips />
    </div>
  );
}

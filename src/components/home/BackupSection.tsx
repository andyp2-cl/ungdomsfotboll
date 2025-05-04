
import React from "react";
import { BackupRestoreActions } from "@/components/backup-restore";

export const BackupSection = () => {
  return (
    <div className="p-6 bg-white border-t shadow-inner">
      <div className="max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-4 text-center">Säkerhetskopiering</h2>
        <div className="bg-slate-50 p-4 rounded-lg border shadow-sm">
          <BackupRestoreActions />
        </div>
      </div>
    </div>
  );
};

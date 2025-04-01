
import { BackupRestoreActions } from "@/components/BackupRestoreActions";

export function FooterActions() {
  return (
    <div className="fixed bottom-4 right-4 z-40 flex gap-2 items-center">
      <BackupRestoreActions />
    </div>
  );
}

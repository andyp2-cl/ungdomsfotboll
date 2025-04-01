
import { Button } from "@/components/ui/button";
import { useEditMode } from "@/contexts/EditModeContext";
import { Lock, Unlock } from "lucide-react";
import { BackupRestoreActions } from "@/components/BackupRestoreActions";

export function EditModeButton() {
  const { isEditMode, showPasswordDialog, exitEditMode } = useEditMode();
  
  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2 items-center">
      <BackupRestoreActions />
      
      {isEditMode ? (
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={exitEditMode}
          className="flex items-center gap-2"
        >
          <Unlock className="h-4 w-4" />
          Avsluta redigering
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={showPasswordDialog}
          className="flex items-center gap-2 bg-white/90 hover:bg-white"
        >
          <Lock className="h-4 w-4" />
          Redigera
        </Button>
      )}
    </div>
  );
}

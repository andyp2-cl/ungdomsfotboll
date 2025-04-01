
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LockKeyhole } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PASSWORD = "tommieannatedandreas";
const EDIT_MODE_KEY = "hifp2014-edit-mode";

interface EditModeContextType {
  isEditMode: boolean;
  showPasswordDialog: () => void;
  exitEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextType | undefined>(undefined);

export function EditModeProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if user is already in edit mode from localStorage
    const editMode = localStorage.getItem(EDIT_MODE_KEY);
    if (editMode === "true") {
      setIsEditMode(true);
    }
  }, []);

  const showPasswordDialog = () => {
    setIsDialogOpen(true);
    setPassword("");
    setError("");
  };

  const exitEditMode = () => {
    setIsEditMode(false);
    localStorage.removeItem(EDIT_MODE_KEY);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === PASSWORD) {
      setIsEditMode(true);
      localStorage.setItem(EDIT_MODE_KEY, "true");
      setIsDialogOpen(false);
      setError("");
    } else {
      setError("Felaktigt lösenord. Försök igen.");
    }
  };

  return (
    <EditModeContext.Provider value={{ isEditMode, showPasswordDialog, exitEditMode }}>
      {children}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <LockKeyhole className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle>Ange lösenord för att redigera</DialogTitle>
            <DialogDescription>
              Du behöver ett lösenord för att kunna redigera information i systemet.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Lösenord</Label>
              <Input 
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ange lösenord"
                autoComplete="off"
              />
              {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
              >
                Avbryt
              </Button>
              <Button type="submit">Låsa upp</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  const context = useContext(EditModeContext);
  if (context === undefined) {
    throw new Error('useEditMode must be used within an EditModeProvider');
  }
  return context;
}

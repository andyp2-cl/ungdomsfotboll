
import React, { useState } from "react";
import { Activity } from "@/types/player";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarPlus, FileText, Upload } from "lucide-react";
import { ActivityFormTab } from "@/components/activity-dialog/ActivityFormTab";
import { TextFormatTab } from "@/components/activity-dialog/TextFormatTab";
import { FileImportTab } from "@/components/activity-dialog/FileImportTab";
import { TabsContent } from "@radix-ui/react-tabs";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddActivity: (activity: Activity) => void;
}

export function AddActivityDialog({ 
  open, 
  onOpenChange, 
  onAddActivity 
}: AddActivityDialogProps) {
  const [activeTab, setActiveTab] = useState<"form" | "text" | "import">("form");

  // Handle dialog close - reset any state if needed
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state if dialog closes
      setActiveTab("form");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lägg till aktivitet</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "form" | "text" | "import")}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="form" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Formulär
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Textformat
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Fil
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="form">
            <ActivityFormTab 
              onAddActivity={onAddActivity}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="text">
            <TextFormatTab 
              onAddActivity={onAddActivity}
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
          
          <TabsContent value="import">
            <FileImportTab 
              onAddActivity={onAddActivity} 
              onClose={() => onOpenChange(false)}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

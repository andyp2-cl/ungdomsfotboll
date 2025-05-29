
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileSpreadsheet } from "lucide-react";

interface ExcelEmptyStateProps {
  onShowSettings: () => void;
}

export function ExcelEmptyState({ onShowSettings }: ExcelEmptyStateProps) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center space-y-3">
          <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <p className="text-lg font-medium">Ingen Excel-fil laddad</p>
            <p className="text-sm text-muted-foreground">
              Ange en Google Sheets URL för att komma igång
            </p>
          </div>
          <Button onClick={onShowSettings} variant="outline">
            Ladda in fil
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


import React from "react";
import { useExcelSheet } from "./hooks/useExcelSheet";
import { ExcelViewer } from "./components/ExcelViewer";
import { ExcelSettings } from "./components/ExcelSettings";
import { ExcelEmptyState } from "./components/ExcelEmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ExcelTabContent() {
  const {
    sheetUrl,
    setSheetUrl,
    embedUrl,
    isLoading,
    showSettings,
    setShowSettings,
    isMouseOverIframe,
    setIsMouseOverIframe,
    isInitializing,
    handleLoadSheet,
    handleClearSheet,
    handleEditSettings,
  } = useExcelSheet();

  // Show loading skeleton while initializing
  if (isInitializing) {
    return (
      <div className="space-y-4 h-full">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <Skeleton className="h-6 w-64" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-2">
            <Skeleton className="h-[600px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full">
      {/* Excel Sheet Display */}
      {embedUrl && (
        <ExcelViewer
          embedUrl={embedUrl}
          sheetUrl={sheetUrl}
          isMouseOverIframe={isMouseOverIframe}
          setIsMouseOverIframe={setIsMouseOverIframe}
          onEditSettings={handleEditSettings}
        />
      )}

      {/* Settings card - shown when no file is loaded or when editing */}
      {(showSettings || !embedUrl) && (
        <ExcelSettings
          sheetUrl={sheetUrl}
          setSheetUrl={setSheetUrl}
          isLoading={isLoading}
          embedUrl={embedUrl}
          showSettings={showSettings}
          onLoadSheet={handleLoadSheet}
          onClearSheet={handleClearSheet}
          onCancel={() => setShowSettings(false)}
        />
      )}

      {/* Empty state - only shown when no file is loaded and settings are hidden */}
      {!embedUrl && !showSettings && (
        <ExcelEmptyState onShowSettings={() => setShowSettings(true)} />
      )}
    </div>
  );
}

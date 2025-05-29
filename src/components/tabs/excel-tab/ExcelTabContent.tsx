
import React from "react";
import { useExcelSheet } from "./hooks/useExcelSheet";
import { ExcelViewer } from "./components/ExcelViewer";
import { ExcelSettings } from "./components/ExcelSettings";
import { ExcelEmptyState } from "./components/ExcelEmptyState";

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
    handleLoadSheet,
    handleClearSheet,
    handleEditSettings,
  } = useExcelSheet();

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

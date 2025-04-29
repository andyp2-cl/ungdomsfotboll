
import React, { useState } from "react";
import { AlertCircle, RefreshCw, Database } from "lucide-react";

interface ErrorStateProps {
  error: string;
  retry?: () => void;
  onDiagnostic?: () => void;
  onForceReconnect?: () => void;
  isCheckingDb?: boolean;
}

export function ErrorState({ 
  error, 
  retry, 
  onDiagnostic, 
  onForceReconnect,
  isCheckingDb = false 
}: ErrorStateProps) {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="mb-4">{error}</p>
        
        {retry && (
          <button 
            onClick={retry} 
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Försök igen
          </button>
        )}
        
        {/* Add database diagnostic button */}
        {onDiagnostic && (
          <button
            onClick={onDiagnostic}
            disabled={isCheckingDb}
            className="mt-4 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {isCheckingDb ? "Kontrollerar databas..." : "Diagnostisera databasanslutning"}
          </button>
        )}
        
        {/* Force reconnect button */}
        {onForceReconnect && (
          <button
            onClick={onForceReconnect}
            disabled={isCheckingDb}
            className="mt-2 bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            {isCheckingDb ? "Återansluter..." : "Tvinga återanslutning"}
          </button>
        )}
      </div>
    </div>
  );
}

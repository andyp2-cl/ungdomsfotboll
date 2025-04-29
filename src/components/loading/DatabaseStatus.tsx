
import React from "react";
import { Database, AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface DatabaseStatusProps {
  status: 'unknown' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  isOnline: boolean;
  onDiagnostic: () => void;
  onForceReconnect: () => void;
  isCheckingDb: boolean;
  isForceReconnecting?: boolean;
  connectionAttempts?: number;
}

export function DatabaseStatus({ 
  status, 
  errorMessage, 
  isOnline, 
  onDiagnostic, 
  onForceReconnect,
  isCheckingDb,
  isForceReconnecting = false,
  connectionAttempts = 0
}: DatabaseStatusProps) {
  if (!isOnline) return null;
  
  // Show progress information if connecting is taking time
  const showProgress = status === 'connecting' && connectionAttempts > 0;
  
  return (
    <div className="flex flex-col items-center justify-center mt-2">
      <div className="flex items-center justify-center text-sm gap-1.5">
        {status === 'connecting' && (
          <div className="text-amber-600 flex items-center gap-1.5">
            <Database className="h-4 w-4 animate-pulse" />
            <span>
              Ansluter till databasen
              {showProgress ? ` (försök ${connectionAttempts})` : '...'}
            </span>
          </div>
        )}
        
        {status === 'connected' && (
          <div className="text-green-600 flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            <span>Ansluten till databasen</span>
          </div>
        )}
        
        {status === 'error' && (
          <div className="text-red-600 flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4" />
            <span>{errorMessage || "Databasfel"}</span>
          </div>
        )}
      </div>
      
      {/* Display diagnostic button after a delay or on error */}
      {(status === 'connecting' && connectionAttempts > 1) || status === 'error' ? (
        <div className="flex flex-col gap-2 mt-3">
          {/* Force reconnect button */}
          <button
            onClick={onForceReconnect}
            disabled={isCheckingDb || isForceReconnecting}
            className="bg-amber-100 hover:bg-amber-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {isForceReconnecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {isForceReconnecting ? "Återansluter..." : "Tvinga återanslutning"}
          </button>
          
          {/* Diagnostic button */}
          <button
            onClick={onDiagnostic}
            disabled={isCheckingDb || isForceReconnecting}
            className="mt-2 bg-blue-100 hover:bg-blue-200 px-4 py-2 rounded text-sm flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            <Database className="h-4 w-4" />
            {isCheckingDb ? "Diagnostiserar..." : "Diagnostisera databasanslutning"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

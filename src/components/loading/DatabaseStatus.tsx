
import React, { useState } from "react";
import { Database, AlertCircle, RefreshCw, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { getConnectionCacheAge } from "@/components/auth/utils/databaseUtils";

interface DatabaseStatusProps {
  status: 'unknown' | 'connecting' | 'connected' | 'error';
  errorMessage: string | null;
  isOnline: boolean;
  onDiagnostic?: () => void;
  onForceReconnect?: () => void;
  isCheckingDb?: boolean;
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
  isForceReconnecting,
  connectionAttempts = 0
}: DatabaseStatusProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Get connection metrics from localStorage
  const getConnectionMetrics = () => {
    try {
      const metricsJson = localStorage.getItem('sb-connection-metrics');
      return metricsJson ? JSON.parse(metricsJson) : {};
    } catch (e) {
      return {};
    }
  };
  
  // Get connection cache age
  const cacheAge = getConnectionCacheAge();
  const metrics = getConnectionMetrics();
  
  // Render the appropriate status badge
  const renderStatusBadge = () => {
    if (status === 'connected') {
      return (
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
          <Database className="h-3 w-3 mr-1" />
          Ansluten
          {cacheAge !== null && <span className="ml-1 text-xs text-green-600">({cacheAge}m)</span>}
        </span>
      );
    } else if (status === 'connecting') {
      return (
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
          <Database className="h-3 w-3 mr-1 animate-pulse" />
          Ansluter...
          {connectionAttempts > 0 && <span className="ml-1 text-xs">Försök {connectionAttempts}</span>}
        </span>
      );
    } else if (status === 'error') {
      return (
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-red-100 text-red-800">
          <AlertCircle className="h-3 w-3 mr-1" />
          Anslutningsfel
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
          <Database className="h-3 w-3 mr-1" />
          Okänd status
        </span>
      );
    }
  };
  
  // If there's an error and we're online, show diagnostic options
  if (status === 'error' && isOnline) {
    return (
      <div className="mt-3 p-2 border border-red-200 rounded bg-red-50">
        <div className="flex items-center justify-between">
          {renderStatusBadge()}
          
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 flex items-center"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? "Dölj detaljer" : "Visa detaljer"}
          </button>
        </div>
        
        {showDetails && (
          <div className="mt-2 text-xs text-red-700 bg-white p-2 rounded">
            <p className="font-semibold">Felmeddelande:</p>
            <p>{errorMessage || "Okänt fel"}</p>
            
            {metrics && (
              <div className="mt-2">
                <p className="font-semibold">Diagnosinformation:</p>
                <ul className="list-disc pl-4">
                  <li>Försök: {connectionAttempts}</li>
                  <li>Senaste försök: {new Date(metrics.timestamp || Date.now()).toLocaleTimeString()}</li>
                  <li>Användarenhet: {metrics.userAgent?.substring(0, 50) || "Okänd"}</li>
                  {metrics.connectionType && <li>Anslutningstyp: {metrics.connectionType}</li>}
                </ul>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-2 flex space-x-2">
          {onDiagnostic && (
            <button
              onClick={onDiagnostic}
              disabled={isCheckingDb}
              className="text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
            >
              <Info className="h-3 w-3" />
              {isCheckingDb ? "Diagnostiserar..." : "Diagnostisera"}
            </button>
          )}
          
          {onForceReconnect && (
            <button
              onClick={onForceReconnect}
              disabled={isForceReconnecting}
              className="text-xs bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded flex items-center gap-1 disabled:opacity-50"
            >
              <RefreshCw className="h-3 w-3" />
              {isForceReconnecting ? "Återansluter..." : "Tvinga återanslutning"}
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Simple status display for other states
  return (
    <div className="mt-3">
      {renderStatusBadge()}
      
      {status === 'connected' && metrics?.lastAttemptTime && (
        <button 
          onClick={() => {
            toast.info(`Anslutning upprättad på ${metrics.successAttempt} försök, ${metrics.lastAttemptTime.toFixed(2)}ms`);
            setShowDetails(!showDetails);
          }} 
          className="ml-2 text-xs text-gray-500 inline-flex items-center"
        >
          <Info className="h-3 w-3 mr-1" />
          Info
        </button>
      )}
    </div>
  );
}

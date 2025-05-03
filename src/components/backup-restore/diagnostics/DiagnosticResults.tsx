
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface DiagnosticResultProps {
  testId: string;
  result: {
    success: boolean;
    message: string;
    details?: Record<string, any>;
  };
}

// Helper function to convert test IDs to human-readable labels
function testToLabel(testId: string): string {
  const labels: Record<string, string> = {
    online: 'Internet-anslutning',
    session: 'Supabase session',
    directApi: 'Direkt API-åtkomst',
    activities: 'Aktiviteter från databasen',
    cache: 'Lokal cache'
  };
  
  return labels[testId] || testId;
}

export function DiagnosticResult({ testId, result }: DiagnosticResultProps) {
  return (
    <div 
      key={testId} 
      className={`p-3 rounded-lg border ${
        result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start">
        <div className="mr-2 mt-0.5">
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
        <div>
          <div className="font-medium">{testToLabel(testId)}</div>
          <div className="text-sm text-gray-600">{result.message}</div>
          
          {result.details && (
            <div className="mt-1 p-2 bg-white rounded text-xs">
              {Object.entries(result.details).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2">
                  <span className="font-medium">{key}:</span>
                  <span className="col-span-2">{
                    typeof value === 'object' 
                      ? JSON.stringify(value) 
                      : String(value)
                  }</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function DiagnosticResultsList({ results }: { 
  results: Record<string, { success: boolean; message: string; details?: any }> 
}) {
  return (
    <div className="grid grid-cols-1 gap-3">
      {Object.entries(results).map(([testId, result]) => (
        <DiagnosticResult key={testId} testId={testId} result={result} />
      ))}
    </div>
  );
}

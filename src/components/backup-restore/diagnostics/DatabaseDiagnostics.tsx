
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { DiagnosticResultsList } from './DiagnosticResults';
import { DiagnosticTools } from './DiagnosticTools';
import { useDiagnostics } from './useDiagnostics';

export function DatabaseDiagnostics() {
  const { 
    isRunningTests, 
    testResults, 
    isPerformingReset,
    runDiagnostics,
    clearAuthAndReconnect
  } = useDiagnostics();
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Databasdiagnostik</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostics} 
          disabled={isRunningTests}
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${isRunningTests ? 'animate-spin' : ''}`} />
          {isRunningTests ? 'Kör tester...' : 'Kör tester igen'}
        </Button>
      </div>
      
      <DiagnosticResultsList results={testResults} />
      
      <DiagnosticTools 
        clearAuthAndReconnect={clearAuthAndReconnect} 
        isPerformingReset={isPerformingReset} 
      />
    </div>
  );
}

// Export both named and default export for compatibility
export default DatabaseDiagnostics;

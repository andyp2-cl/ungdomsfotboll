
import React from 'react';
import { AlertDialogCancel, AlertDialogFooter } from '@/components/ui/alert-dialog';
import DatabaseDiagnostics from '../diagnostics/DatabaseDiagnostics';

interface DiagnosticTabContentProps {
  onCancel: () => void;
}

export function DiagnosticTabContent({ onCancel }: DiagnosticTabContentProps) {
  return (
    <>
      <div className="py-2">
        <DatabaseDiagnostics />
      </div>
      
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel}>Stäng</AlertDialogCancel>
      </AlertDialogFooter>
    </>
  );
}

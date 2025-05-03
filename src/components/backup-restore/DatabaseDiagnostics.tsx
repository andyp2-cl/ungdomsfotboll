
// Re-export from the new modular structure
export { DatabaseDiagnostics } from './diagnostics/DatabaseDiagnostics';
export { useDiagnostics } from './diagnostics/useDiagnostics';

// We export both the named export and a default export for backward compatibility
export { default } from './diagnostics/DatabaseDiagnostics';

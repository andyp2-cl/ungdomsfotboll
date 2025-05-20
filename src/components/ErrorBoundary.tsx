
import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg shadow-sm space-y-4 my-4 bg-muted/10">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
          <h2 className="text-xl font-semibold">Något gick fel</h2>
          <p className="text-center max-w-md text-muted-foreground">
            Ett fel har uppstått i denna sektion av applikationen. Övriga delar bör fortfarande fungera.
          </p>
          {this.state.error && (
            <div className="bg-muted p-2 rounded text-sm overflow-auto max-w-full">
              <code>{this.state.error.message}</code>
            </div>
          )}
          <Button onClick={this.handleReset}>Återställ och försök igen</Button>
        </div>
      );
    }

    return this.props.children;
  }
}

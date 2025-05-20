
import React from "react";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

interface LoadingStateProps {
  message?: string;
  variant?: "spinner" | "skeleton";
  rows?: number;
}

export function LoadingState({ 
  message = "Laddar data från databasen...", 
  variant = "spinner",
  rows = 3
}: LoadingStateProps) {
  if (variant === "skeleton") {
    return (
      <div className="space-y-4">
        {Array(rows).fill(0).map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <Spinner className="h-12 w-12 mx-auto mb-4" />
        <p>{message}</p>
      </div>
    </div>
  );
}

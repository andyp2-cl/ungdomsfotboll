
import React from "react";

export function LoadingState() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>Laddar data från databasen...</p>
      </div>
    </div>
  );
}

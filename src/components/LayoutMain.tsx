
import React from "react";
import Header from "./Header";
import { PerformanceMonitor } from "./loading/PerformanceMonitor";

export default function LayoutMain({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">
        <main className="container mx-auto p-4">
          {children}
        </main>
      </div>
      <footer className="bg-gray-100 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Hässleholm IF
        </div>
      </footer>
      
      <PerformanceMonitor />
    </div>
  );
}

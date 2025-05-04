
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

// Export Layout component to be used in pages
export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        {children}
      </div>
    </div>
  );
}

// Export as LayoutMain for backward compatibility
export { Layout as LayoutMain };

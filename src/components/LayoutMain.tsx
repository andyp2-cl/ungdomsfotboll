
import { ReactNode } from "react";
import { Layout } from "@/components/Layout";

interface LayoutMainProps {
  children: ReactNode;
  title?: string;
  isLoading?: boolean;
}

export function LayoutMain({ children, title, isLoading = false }: LayoutMainProps) {
  return (
    <Layout>
      {title && <h1 className="text-2xl font-bold mb-4">{title}</h1>}
      {isLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : children}
    </Layout>
  );
}

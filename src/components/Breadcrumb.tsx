
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <Link to="/" className="flex items-center hover:text-[#006633]">
        <Home className="h-4 w-4 mr-1" />
        <span>Hem</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="h-4 w-4 mx-2" />
          {item.href ? (
            <Link 
              to={item.href} 
              className="hover:text-[#006633]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-medium text-[#006633]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

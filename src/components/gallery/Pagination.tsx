"use client";

import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  // totalItems, // kept for potential future use but hidden for cleaner UI
  // itemsPerPage,
  className,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const getPages = () => {
    const pages = [];
    // Always show first, last, and window around current
    // This is a simplified logic for cleaner UI
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
    >
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="First page"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Prev */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers - Hidden on very small screens, shown on sm+ */}
      <div className="flex items-center space-x-1 mx-2">
        {getPages().map((page, i) => (
          <React.Fragment key={i}>
            {page === "..." ? (
              <span className="w-8 h-8 flex items-center justify-center text-gray-300 text-xs">
                •••
              </span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={cn(
                  "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
                  currentPage === page
                    ? "bg-black text-white shadow-sm scale-110"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Last page"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

interface ToolButtonProps {
  checked?: boolean;
  style?: string;
  children: React.ReactNode;
  disabled?: boolean;
  ToolTipLabel?: string;
  onClick: any;
}

const ToolButton = forwardRef<HTMLButtonElement, ToolButtonProps>(
  ({ checked, style, children, onClick, disabled = false, ToolTipLabel }, ref) => {
    return (
      <button
        ref={ref} // Attach the ref here
        disabled={disabled}
        type="button"
        onClick={onClick}
        className={cn(
          `
          flex flex-row items-center justify-center gap-x-3 rounded-md
          h-[32px] px-2 text-sm
          text-primary 
          transition-colors duration-300  
          border
          `,
          checked ? "bg-muted-foreground/70 dark:bg-muted-foreground/40" : "hover:bg-muted-foreground/70 dark:hover:bg-muted-foreground/40",  // Updated condition for background color
          style
        )}
      >
        {children}
      </button>
    );
  }
);

ToolButton.displayName = "ToolButton"; // Add displayName for better debugging

export default ToolButton;

import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      helperText,
      startAdornment,
      endAdornment,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="flex flex-col">
        {label && (
          <label className="mb-1 text-sm text-foreground">{label}</label>
        )}
        <div
          className={cn(
            "flex items-center h-10 w-full rounded-lg bg-over text-sm disabled:cursor-not-allowed disabled:opacity-50 bg-surface0",
            className,
          )}
        >
          {startAdornment && (
            <span className="px-2 text-sm text-muted-foreground">
              {startAdornment}
            </span>
          )}
          <input
            type={type}
            className={cn(
              "flex-1 px-3 py-2 placeholder:text-subtext0 focus:outline-none disabled:opacity-50 rounded-lg bg-surface0",
              {
                "pl-0": startAdornment,
              },
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span className="px-3 text-sm text-foreground">{endAdornment}</span>
          )}
        </div>
        {helperText && (
          <span className="mt-1 text-xs text-foreground">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };

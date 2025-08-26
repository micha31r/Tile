import { cn } from "@/lib/utils";
import React, { forwardRef } from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        autoComplete="off"
        data-1p-ignore
        data-lpignore="true"
        data-protonpass-ignore="true"
        className={cn(
          "bg-secondary placeholder:text-muted-foreground py-3 indent-4 rounded-2xl w-full outline-2 -outline-offset-2 outline-border",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export default Input;

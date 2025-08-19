import { cn } from "@/lib/utils";
import React from "react";

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string;
};

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      autoComplete="off"
      data-1p-ignore data-lpignore="true"
      data-protonpass-ignore="true"
      className={cn("bg-secondary placeholder:text-muted-foreground py-4 indent-4 rounded-2xl w-full outline-2 -outline-offset-2 outline-border", className)}
      {...props}
    />
  );
}
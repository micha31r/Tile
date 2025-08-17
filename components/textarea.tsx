import { cn } from "@/lib/utils";
import React from "react";

type TextAreaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
};

export default function TextArea({ className, ...props }: TextAreaProps) {
  return (
    <textarea
      autoComplete="off"
      data-1p-ignore data-lpignore="true"
      data-protonpass-ignore="true"
      className={cn("flex bg-secondary placeholder:text-muted-foreground p-4 rounded-2xl w-full outline-2 -outline-offset-2 outline-border font-medium", className)}
      {...props}
    />
  );
}
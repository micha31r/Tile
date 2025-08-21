import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center h-full", className)}>
      <Logo />
    </div>
  );
}

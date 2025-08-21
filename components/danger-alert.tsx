export function DangerAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="break-words grid grid-cols-[auto,1fr] gap-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 font-medium p-3 text-sm [&_svg]:h-4 [&_svg]:w-4 [&_svg]:mt-0.5">
      {children}
    </div>
  );
}

export function WarningAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto,1fr] gap-2 rounded-xl bg-yellow-50 text-yellow-600 font-medium p-3 text-sm [&_svg]:h-4 [&_svg]:w-4 [&_svg]:mt-0.5">
      {children}
    </div>
  );
}

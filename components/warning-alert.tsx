export function WarningAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row gap-2 items-center rounded-xl bg-yellow-50 text-yellow-600 font-medium p-3 text-sm">
      {children}
    </div>
  );
}

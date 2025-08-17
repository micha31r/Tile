export function DangerAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-row gap-2 items-center rounded-xl bg-red-100 text-red-600 font-medium p-3 text-sm">
      {children}
    </div>
  );
}

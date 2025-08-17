export function InfoAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[auto,1fr] gap-2 rounded-xl bg-blue-100 text-blue-700 font-medium p-3 text-sm [&_svg]:h-4 [&_svg]:w-4 [&_svg]:mt-0.5">
      {children}
    </div>
  );
}

import React from "react";

export function AppFrame({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-col h-[100svh] w-full max-w-96 bg-background rounded-[48px] px-4 pt-8 overflow-y-auto">
      <div className="flex flex-col flex-1 pb-8">
        {children}
      </div>
    </main>
  );
}
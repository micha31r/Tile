import React from "react";

export function AppFrame({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex flex-col h-[100svh] w-full sm:max-w-96 max-w-md bg-background sm:rounded-[48px] px-4 sm:pt-8 pt-4 overflow-y-auto">
      <div className="flex flex-col flex-1 sm:pb-8 pb-4">
        {children}
      </div>
    </main>
  );
}
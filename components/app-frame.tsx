import React from "react";

export function AppFrame({ children }: { children?: React.ReactNode }) {
  return (
    <main className="flex relative h-[100svh] w-full max-w-96 bg-background rounded-[48px] px-4 py-8">
      {children}
    </main>
  )
}
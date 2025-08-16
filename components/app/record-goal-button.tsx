"use client"

import { Popup } from "./popup";

export function RecordGoalButton() {
  return (
    <Popup title="Record daily goal" trigger={(callback) => (
      <button onClick={callback} type="submit" className="bg-blue-700 disabled:opacity-80 text-background rounded-full px-6 py-2.5 w-full text-md font-medium hover:scale-95 disabled:hover:scale-100 transition-transform">
        Record today&apos;s goals
      </button>
    )}>
      <p className="">This is the popup content.</p>
    </Popup>
  )
}
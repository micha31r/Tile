"use client";

import React, { useEffect, useState } from "react";

type CountdownProps = {
  target: Date;
};

export function Countdown({ target }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<number>(target.getTime() - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(Math.max(target.getTime() - Date.now(), 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex w-max items-center justify-between text-2xl font-medium">
      <span className="w-8">{pad(hours)}</span>
      <span className="w-8 text-center">:</span>
      <span className="w-8">{pad(minutes)}</span>
      <span className="w-8 text-center">:</span>
      <span className="w-8">{pad(seconds)}</span>
    </div>
  );
}
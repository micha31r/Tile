"use client"

import { cn } from "@/lib/utils";
import Avvvatars from "avvvatars-react"
import { useEffect, useState } from "react";

export default function Avatar({ 
  size, 
  value, 
  style = "character", 
  displayValue 
}: { 
  size?: number, 
  value: string, 
  style?: 'character' | 'shape', 
  displayValue?: string 
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(id);
  }, []);

  return (
    <div className={cn("transition-opacity opacity-0", {
      "opacity-100": loaded
    })} style={{ width: size, height: size }}>
      <Avvvatars size={size} style={style} value={value} displayValue={displayValue} />
    </div>
  )
}
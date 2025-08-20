"use client";

import { cn, getDisplayName, getInitials } from "@/lib/utils";
import Avvvatars from "avvvatars-react";
import { useEffect, useState } from "react";

export default function Avatar({ 
  size, 
  firstName, 
  lastName,
  email,
  style = "character", 
}: { 
  size?: number, 
  firstName?: string,
  lastName?: string,
  email: string,
  style?: 'character' | 'shape', 
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      setLoaded(true);
    }, 100);

    return () => clearTimeout(id);
  }, []);

  const displayName = getDisplayName(firstName, lastName);
  const initials = getInitials(firstName, lastName);

  return (
    <div className={cn("transition-opacity opacity-0", {
      "opacity-100": loaded
    })} style={{ width: size, height: size }}>
      <Avvvatars size={size} style={style} value={displayName || email} displayValue={initials} />
    </div>
  );
}
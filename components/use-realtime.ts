"use client"

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

export interface EntryWithUUID {
  id: string;
}

export function useRealtime<T extends EntryWithUUID>(
  schema: string, 
  table: string, 
  filter?: string, 
  getInitialData?: () => Promise<T[]>
) {
  const [entries, setEntries] = useState<T[]>([])

  useEffect(() => {
    const supabase = createClient();

    const fetchInitial = async () => {
      const data = getInitialData ? await getInitialData() : [];
      setEntries((data as unknown as T[]) ?? [])
    }

    fetchInitial()

    const channel = supabase
     .channel('table-db-changes', {
        config: { private: true },
     })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goal',
          ...(filter ? { filter } : {}),
        },
        payload => {
          console.log('Change received!', payload)
          if (payload.eventType === 'INSERT') setEntries(prev => [...prev, payload.new as T])
          if (payload.eventType === 'UPDATE') setEntries(prev => prev.map(i => i.id === payload.new.id ? payload.new as T : i))
          if (payload.eventType === 'DELETE') setEntries(prev => prev.filter(i => i.id !== payload.old.id))
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [entries, setEntries];
}

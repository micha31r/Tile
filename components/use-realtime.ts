/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabase/client";

function defaultOnInsert<T>(prev: any[], payload: any): T[] {
  return [...prev, payload.new as any];
}

function defaultOnUpdate<T>(prev: any[], payload: any): T[] {
  return prev.map(i => i.id === payload.new.id ? payload.new as any : i);
}

function defaultOnDelete<T>(prev: any[], payload: any): T[] {
  return prev.filter(i => i.id !== payload.old.id);
}
  
export interface UseRealtimeOptions<T> {
  channelName: string;
  schema: string;
  table: string;
  filter?: string;
  getInitialData?: () => Promise<T[]>;
  onInsert?: (prev: T[], payload: any) => T[];
  onUpdate?: (prev: T[], payload: any) => T[];
  onDelete?: (prev: T[], payload: any) => T[];
}

export function useRealtime<T>(options: UseRealtimeOptions<T>) {
  const {
    channelName,
    schema,
    table,
    filter,
    getInitialData,
    onInsert,
    onUpdate,
    onDelete,
  } = options;
  const [entries, setEntries] = useState<T[]>([])

  useEffect(() => {
    const supabase = createClient();

    const fetchInitial = async () => {
      const data = getInitialData ? await getInitialData() : [];
      setEntries((data as unknown as T[]) ?? [])
    }

    fetchInitial()

    const channel = supabase
      .channel(channelName, {
        config: { private: true },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema,
          table,
          ...(filter ? { filter } : {}),
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setEntries(prev => (onInsert ?? defaultOnInsert)(prev, payload));
          }
          if (payload.eventType === 'UPDATE') {
            setEntries(prev => (onUpdate ?? defaultOnUpdate)(prev, payload));
          }
          if (payload.eventType === 'DELETE') {
            setEntries(prev => (onDelete ?? defaultOnDelete)(prev, payload));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [entries, setEntries];
}

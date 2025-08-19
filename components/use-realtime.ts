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
  onInsert?: (prev: T[], payload: any) => T[] | Promise<T[]>;
  onUpdate?: (prev: T[], payload: any) => T[] | Promise<T[]>;
  onDelete?: (prev: T[], payload: any) => T[] | Promise<T[]>;
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
          const handle = (
            handler: ((prev: T[], payload: any) => T[] | Promise<T[]>) | undefined,
            fallback: (prev: T[], payload: any) => T[]
          ) => {
            setEntries(prev => {
              try {
                const fn = handler ?? fallback;
                const result = fn(prev, payload);
                if (result instanceof Promise) {
                  result.then(resolved => setEntries(resolved));
                  return prev; // Don't update until resolved
                }
                return result;
              } catch {
                return prev;
              }
            });
          };
          if (payload.eventType === 'INSERT') {
            handle(onInsert, defaultOnInsert);
          }
          if (payload.eventType === 'UPDATE') {
            handle(onUpdate, defaultOnUpdate);
          }
          if (payload.eventType === 'DELETE') {
            handle(onDelete, defaultOnDelete);
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

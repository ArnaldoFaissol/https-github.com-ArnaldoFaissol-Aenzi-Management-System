import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

/**
 * Hook for real-time subscriptions to a Supabase table.
 * ALWAYS use this hook instead of subscribing inline.
 * This automatically manages channel lifecycle and prevents memory leaks.
 */
export function useRealtime(
  tableName: string,
  callback: (payload: any) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName }, (payload) => {
        callbackRef.current(payload)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, enabled])
}

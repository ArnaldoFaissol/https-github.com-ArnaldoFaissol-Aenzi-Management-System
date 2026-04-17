import { useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

/**
 * Payload compat layer: keep the existing contract `{ action, record }`
 * so existing callers that (optionally) read payload.action continue to work.
 */
type CompatPayload = {
  action: 'create' | 'update' | 'delete'
  record: any
}

const mapEventType = (e: string): CompatPayload['action'] => {
  if (e === 'INSERT') return 'create'
  if (e === 'DELETE') return 'delete'
  return 'update'
}

// Tabelas que nao existem no Supabase — assinaturas nelas sao silenciosamente ignoradas.
const UNSUPPORTED_TABLES = new Set(['rollout_stages'])

/**
 * Hook for real-time subscriptions to a Supabase table.
 * Keeps the same signature as the legacy PocketBase-based hook.
 */
export function useRealtime(
  tableName: string,
  callback: (data: CompatPayload) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return
    if (UNSUPPORTED_TABLES.has(tableName)) return

    const channel = supabase
      .channel(`realtime:${tableName}:${Math.random().toString(36).slice(2, 8)}`)
      .on(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        'postgres_changes' as any,
        { event: '*', schema: 'public', table: tableName },
        (payload: any) => {
          callbackRef.current({
            action: mapEventType(payload.eventType),
            record: payload.new ?? payload.old ?? {},
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel).catch(() => {})
    }
  }, [tableName, enabled])
}

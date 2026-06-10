import { supabase } from './supabase'

export function logEvent(eventType: string, payload: Record<string, any> = {}) {
  supabase.auth.getUser().then(({ data: { user } }) => {
    supabase.from('analytics_events').insert({
      event_type: eventType,
      user_id: user?.id ?? null,
      payload,
    })
  })
}

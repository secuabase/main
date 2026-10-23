import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database, Json } from './types';

/**
 * What to write into `events`. The database fills actor_id, actor_role,
 * ip, user_agent and created_at by itself (see `log_event` in the migrations).
 */
export type LogEventParams = {
  /** Client the event belongs to. Null for admin-only or account-level events. */
  clientId?: string | null;
  /** Short dotted verb, e.g. `clients.view`, `filing.approve`, `invite.send`. */
  action: string;
  /** Table or object kind, e.g. `clients`, `filing`, `invoice`. */
  objectType: string;
  /** Id of the object as text. */
  objectId?: string | null;
  /** Row or state before the change. */
  before?: Json | null;
  /** Row or state after the change. */
  after?: Json | null;
};

/**
 * Server-side helper: write one audit row through the `log_event` RPC.
 * Use it for views, approvals, signatures and payments; plain table writes on
 * clients, client_members, profiles and admin_settings are logged by triggers.
 *
 * Returns the new `events.id`. Throws on a database error.
 */
export async function logEvent(
  supabase: SupabaseClient<Database>,
  params: LogEventParams,
): Promise<number> {
  const { data, error } = await supabase.rpc('log_event', {
    p_client_id: params.clientId ?? null,
    p_action: params.action,
    p_object_type: params.objectType,
    p_object_id: params.objectId ?? null,
    p_before: params.before ?? null,
    p_after: params.after ?? null,
  });

  if (error) {
    throw new Error(`log_event failed for ${params.action}: ${error.message}`);
  }

  return data;
}

import { createClient, type PostgrestError, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/db/types';

export type Db = SupabaseClient<Database>;

/** Seed users from docs/phase-1-spec.md. Password comes from SEED_PASSWORD. */
export const SEED_USERS = {
  admin: 'hello@secuabase.com',
  owner: 'anna@alpenhaus.de',
  editor: 'editor@alpenhaus.de',
  viewer: 'viewer@alpenhaus.de',
  billing: 'billing@alpenhaus.de',
  kettleOwner: 'owner@kettle.co',
} as const;

export const ALPENHAUS_SLUG = 'alpenhaus-textil';
export const KETTLE_SLUG = 'kettle-and-co';
export const ALPENHAUS_MEMBER_COUNT = 4;
export const CLIENT_COUNT = 12;
export const PLAN_COUNT = 5;

export const TABLES = [
  'profiles',
  'plans',
  'clients',
  'client_members',
  'admin_settings',
  'events',
] as const;
export type TableName = (typeof TABLES)[number];

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. Add it to .env.local.`);
  return value;
}

export const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Secuabase-Seed-2026!';

/** A client with the publishable key and no session: the anonymous role. */
export function anonClient(): Db {
  return createClient<Database>(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY'), {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

/** Sign one seed user in with the password flow. */
export async function signIn(email: string): Promise<{ db: Db; userId: string }> {
  const db = anonClient();
  const { data, error } = await db.auth.signInWithPassword({ email, password: SEED_PASSWORD });
  if (error || !data.user) {
    throw new Error(`Sign-in failed for ${email}: ${error?.message ?? 'no user'}`);
  }
  return { db, userId: data.user.id };
}

/**
 * The same client without the Database generic. Use it for writes that the
 * types forbid on purpose (e.g. inserting into events) so we can prove the
 * database refuses them too.
 */
export function raw(db: Db): SupabaseClient {
  return db as unknown as SupabaseClient;
}

/** Exact row count the caller is allowed to see. */
export async function countRows(db: Db, table: TableName): Promise<number> {
  const { count, error } = await raw(db).from(table).select('*', { count: 'exact', head: true });
  if (error) throw new Error(`count(${table}) failed: ${error.message}`);
  return count ?? 0;
}

export async function clientBySlug(db: Db, slug: string) {
  const { data, error } = await db.from('clients').select('*').eq('slug', slug).maybeSingle();
  if (error) throw new Error(`clients by slug failed: ${error.message}`);
  return data;
}

/** True when PostgREST reports a row-level-security or permission refusal. */
export function isPermissionError(error: PostgrestError | null): boolean {
  if (!error) return false;
  return (
    error.code === '42501' ||
    /row-level security/i.test(error.message) ||
    /permission denied/i.test(error.message)
  );
}

/** Newest event matching action + object_id that the caller can see. */
export async function latestEvent(db: Db, action: string, objectId: string) {
  const { data, error } = await db
    .from('events')
    .select('*')
    .eq('action', action)
    .eq('object_id', objectId)
    .order('id', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`events lookup failed: ${error.message}`);
  return data;
}

export function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new Error('Expected a JSON object');
}

/**
 * Secuabase Phase 1 seed. Idempotent: safe to run again.
 *
 *   npm run seed
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local.
 * Creates the seed users (password SEED_PASSWORD), the plans, the 12 sample
 * clients and the memberships from docs/phase-1-spec.md.
 * Pure-SQL fallback: supabase/seed.sql.
 */

import { config } from 'dotenv';
import { createClient, type User } from '@supabase/supabase-js';
import type { ClientHealth, ClientStage, Database, MemberRole } from '../src/lib/db/types';

config({ path: '.env.local', quiet: true });

function env(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.local (never commit it).`);
  }
  return value;
}

const SUPABASE_URL = env('NEXT_PUBLIC_SUPABASE_URL');
const SECRET_KEY = env('SUPABASE_SECRET_KEY');
const SEED_PASSWORD = process.env.SEED_PASSWORD ?? 'Secuabase-Seed-2026!';

if (SUPABASE_URL.includes('hjxzlspisflxqsiyigmy')) {
  // Live project. Sample clients must never land there by accident.
  throw new Error('Refusing to seed the live project. Point .env.local at staging.');
}

const supabase = createClient<Database>(SUPABASE_URL, SECRET_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

// Seed data ----------------------------------------------------------------

type SeedUser = { email: string; fullName: string; isAdmin?: boolean };

const USERS: SeedUser[] = [
  { email: 'hello@secuabase.com', fullName: 'Bugra Buyukduykular', isAdmin: true },
  { email: 'anna@alpenhaus.de', fullName: 'Anna Weber' },
  { email: 'editor@alpenhaus.de', fullName: 'Jonas Keller' },
  { email: 'viewer@alpenhaus.de', fullName: 'Mira Hoffmann' },
  { email: 'billing@alpenhaus.de', fullName: 'Lukas Braun' },
  { email: 'owner@kettle.co', fullName: 'Sam Kettle' },
];

const PLANS: Database['public']['Tables']['plans']['Insert'][] = [
  { id: 'free_pilot', name: 'Free pilot', setup_fee_cents: 0, monthly_cents: 0, currency: 'EUR', product_limit: 5, rule_limit: 1, member_limit: null, pilot_days: 30, sort: 1 },
  { id: 'founding', name: 'Founding', setup_fee_cents: 50_000, monthly_cents: 150_000, currency: 'EUR', product_limit: null, rule_limit: null, member_limit: null, pilot_days: null, sort: 2 },
  { id: 'starter', name: 'Starter', setup_fee_cents: 750_000, monthly_cents: 350_000, currency: 'EUR', product_limit: 150, rule_limit: null, member_limit: null, pilot_days: null, sort: 3 },
  { id: 'growth', name: 'Growth', setup_fee_cents: 1_000_000, monthly_cents: 600_000, currency: 'EUR', product_limit: 500, rule_limit: null, member_limit: null, pilot_days: null, sort: 4 },
  { id: 'scale', name: 'Scale', setup_fee_cents: 1_500_000, monthly_cents: 900_000, currency: 'EUR', product_limit: null, rule_limit: null, member_limit: null, pilot_days: null, sort: 5 },
];

type SeedClient = {
  name: string;
  slug: string;
  country: string;
  currency: string;
  plan: string;
  stage: ClientStage;
  health: ClientHealth;
  mrr: number;
  pilotDays?: number;
  invitedDaysAgo?: number;
  contactName: string;
  contactEmail: string;
};

const CLIENTS: SeedClient[] = [
  { name: 'Alpenhaus Textil', slug: 'alpenhaus-textil', country: 'DE', currency: 'EUR', plan: 'growth', stage: 'paid', health: 'on_track', mrr: 600_000, contactName: 'Anna Weber', contactEmail: 'anna@alpenhaus.de' },
  { name: 'Brightleaf Home', slug: 'brightleaf-home', country: 'US', currency: 'USD', plan: 'starter', stage: 'paid', health: 'on_track', mrr: 350_000, contactName: 'Dana Whitfield', contactEmail: 'dana@brightleafhome.com' },
  { name: 'Kettle & Co', slug: 'kettle-and-co', country: 'US', currency: 'USD', plan: 'starter', stage: 'paid', health: 'at_risk', mrr: 350_000, contactName: 'Sam Kettle', contactEmail: 'owner@kettle.co' },
  { name: 'Nordvik Outdoor', slug: 'nordvik-outdoor', country: 'NO', currency: 'EUR', plan: 'starter', stage: 'paid', health: 'on_track', mrr: 350_000, contactName: 'Ingrid Nordvik', contactEmail: 'ingrid@nordvik.no' },
  { name: 'Voltwise', slug: 'voltwise', country: 'ES', currency: 'EUR', plan: 'founding', stage: 'paid', health: 'on_track', mrr: 150_000, contactName: 'Carlos Vega', contactEmail: 'carlos@voltwise.es' },
  { name: 'Casa Lino', slug: 'casa-lino', country: 'IT', currency: 'EUR', plan: 'founding', stage: 'paid', health: 'on_track', mrr: 150_000, contactName: 'Giulia Ferri', contactEmail: 'giulia@casalino.it' },
  { name: 'Fjell Gear', slug: 'fjell-gear', country: 'SE', currency: 'EUR', plan: 'free_pilot', stage: 'pilot', health: 'blocked', mrr: 0, pilotDays: 12, contactName: 'Erik Lund', contactEmail: 'erik@fjellgear.se' },
  { name: 'Pinebrook Kids', slug: 'pinebrook-kids', country: 'UK', currency: 'EUR', plan: 'free_pilot', stage: 'pilot', health: 'on_track', mrr: 0, pilotDays: 21, contactName: 'Holly Pine', contactEmail: 'holly@pinebrookkids.co.uk' },
  { name: 'Rikka Kitchen', slug: 'rikka-kitchen', country: 'FI', currency: 'EUR', plan: 'free_pilot', stage: 'pilot', health: 'on_track', mrr: 0, pilotDays: 26, contactName: 'Riikka Salo', contactEmail: 'riikka@rikkakitchen.fi' },
  { name: 'Lumo Kids', slug: 'lumo-kids', country: 'NL', currency: 'EUR', plan: 'founding', stage: 'onboarding', health: 'at_risk', mrr: 0, contactName: 'Noor de Vries', contactEmail: 'noor@lumokids.nl' },
  { name: 'Bergwald Sport', slug: 'bergwald-sport', country: 'AT', currency: 'EUR', plan: 'free_pilot', stage: 'invited', health: 'on_track', mrr: 0, invitedDaysAgo: 2, contactName: 'Felix Berger', contactEmail: 'felix@bergwaldsport.at' },
  { name: 'Maison Flore', slug: 'maison-flore', country: 'FR', currency: 'EUR', plan: 'starter', stage: 'invited', health: 'on_track', mrr: 0, invitedDaysAgo: 1, contactName: 'Claire Flore', contactEmail: 'claire@maisonflore.fr' },
];

const MEMBERSHIPS: { clientSlug: string; email: string; role: MemberRole }[] = [
  { clientSlug: 'alpenhaus-textil', email: 'anna@alpenhaus.de', role: 'owner' },
  { clientSlug: 'alpenhaus-textil', email: 'editor@alpenhaus.de', role: 'editor' },
  { clientSlug: 'alpenhaus-textil', email: 'viewer@alpenhaus.de', role: 'viewer' },
  { clientSlug: 'alpenhaus-textil', email: 'billing@alpenhaus.de', role: 'billing' },
  { clientSlug: 'kettle-and-co', email: 'owner@kettle.co', role: 'owner' },
];

// Steps --------------------------------------------------------------------

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function listAllUsers(): Promise<User[]> {
  const users: User[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw new Error(`listUsers failed: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < 200) break;
  }
  return users;
}

async function ensureUsers(): Promise<Map<string, string>> {
  const existing = new Map(
    (await listAllUsers())
      .filter((u) => typeof u.email === 'string')
      .map((u) => [u.email!.toLowerCase(), u] as const),
  );
  const ids = new Map<string, string>();
  let created = 0;

  for (const user of USERS) {
    const found = existing.get(user.email.toLowerCase());
    if (found) {
      // Keep the seed password and name in sync so the RLS tests can sign in.
      const { error } = await supabase.auth.admin.updateUserById(found.id, {
        password: SEED_PASSWORD,
        email_confirm: true,
        user_metadata: { ...found.user_metadata, full_name: user.fullName },
      });
      if (error) throw new Error(`updateUserById(${user.email}) failed: ${error.message}`);
      ids.set(user.email, found.id);
      continue;
    }
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: SEED_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: user.fullName },
    });
    if (error || !data.user) throw new Error(`createUser(${user.email}) failed: ${error?.message}`);
    ids.set(user.email, data.user.id);
    created++;
  }

  // The auth trigger made the profile rows; make sure name and admin flag match.
  const { error } = await supabase.from('profiles').upsert(
    USERS.map((u) => ({
      id: ids.get(u.email)!,
      email: u.email,
      full_name: u.fullName,
      is_admin: u.isAdmin ?? false,
    })),
    { onConflict: 'id' },
  );
  if (error) throw new Error(`profiles upsert failed: ${error.message}`);

  console.log(`users: ${USERS.length} (${created} created)`);
  return ids;
}

async function ensurePlans(): Promise<void> {
  const { error } = await supabase.from('plans').upsert(PLANS, { onConflict: 'id' });
  if (error) throw new Error(`plans upsert failed: ${error.message}`);
  console.log(`plans: ${PLANS.length}`);
}

async function ensureClients(): Promise<Map<string, string>> {
  // Keep dates already on staging so re-runs do not move pilots around.
  const { data: current, error: readError } = await supabase
    .from('clients')
    .select('slug, pilot_ends_at, invited_at')
    .in('slug', CLIENTS.map((c) => c.slug));
  if (readError) throw new Error(`clients read failed: ${readError.message}`);
  const existing = new Map((current ?? []).map((c) => [c.slug, c] as const));

  const rows: Database['public']['Tables']['clients']['Insert'][] = CLIENTS.map((c) => {
    const old = existing.get(c.slug);
    return {
      name: c.name,
      slug: c.slug,
      stage: c.stage,
      plan_id: c.plan,
      country: c.country,
      currency: c.currency,
      health: c.health,
      mrr_cents: c.mrr,
      pilot_ends_at: old?.pilot_ends_at ?? (c.pilotDays ? daysFromNow(c.pilotDays) : null),
      invited_at: old?.invited_at ?? (c.invitedDaysAgo ? daysFromNow(-c.invitedDaysAgo) : null),
      contact_name: c.contactName,
      contact_email: c.contactEmail,
      deleted_at: null,
    };
  });

  const { data, error } = await supabase
    .from('clients')
    .upsert(rows, { onConflict: 'slug' })
    .select('id, slug');
  if (error) throw new Error(`clients upsert failed: ${error.message}`);

  console.log(`clients: ${data.length}`);
  return new Map(data.map((c) => [c.slug, c.id] as const));
}

async function ensureMemberships(userIds: Map<string, string>, clientIds: Map<string, string>): Promise<void> {
  const rows = MEMBERSHIPS.map((m) => {
    const client_id = clientIds.get(m.clientSlug);
    const user_id = userIds.get(m.email);
    if (!client_id || !user_id) throw new Error(`Membership refers to unknown client or user: ${m.clientSlug} / ${m.email}`);
    return { client_id, user_id, role: m.role, status: 'active' as const, invited_email: m.email };
  });

  const { error } = await supabase.from('client_members').upsert(rows, { onConflict: 'client_id,user_id' });
  if (error) throw new Error(`client_members upsert failed: ${error.message}`);
  console.log(`memberships: ${rows.length}`);
}

async function main(): Promise<void> {
  const userIds = await ensureUsers();
  await ensurePlans();
  const clientIds = await ensureClients();
  await ensureMemberships(userIds, clientIds);
  console.log(
    `Seed OK: ${USERS.length} users, ${PLANS.length} plans, ${CLIENTS.length} clients, ${MEMBERSHIPS.length} memberships on ${new URL(SUPABASE_URL).host}`,
  );
}

main().catch((err: unknown) => {
  console.error('Seed failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});

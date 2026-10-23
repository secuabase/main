import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ALPENHAUS_SLUG,
  CLIENT_COUNT,
  KETTLE_SLUG,
  PLAN_COUNT,
  SEED_USERS,
  asRecord,
  clientBySlug,
  countRows,
  latestEvent,
  signIn,
  type Db,
} from './helpers';

const SETTING_KEY = 'rls_test.admin_marker';

describe('RLS: admin (hello@secuabase.com)', () => {
  let db: Db;
  let userId: string;
  let alpenhausId: string;
  let originalContact: string | null;

  beforeAll(async () => {
    ({ db, userId } = await signIn(SEED_USERS.admin));
    const alpenhaus = await clientBySlug(db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Seed missing: Alpenhaus Textil');
    alpenhausId = alpenhaus.id;
    originalContact = alpenhaus.contact_name;
  });

  afterAll(async () => {
    await db.from('clients').update({ contact_name: originalContact }).eq('id', alpenhausId);
    await db.from('admin_settings').delete().eq('key', SETTING_KEY);
    await db.auth.signOut();
  });

  it('is flagged as admin on its own profile', async () => {
    const { data } = await db.from('profiles').select('is_admin').eq('id', userId).single();
    expect(data?.is_admin).toBe(true);
  });

  it('sees every profile', async () => {
    expect(await countRows(db, 'profiles')).toBeGreaterThanOrEqual(6);
  });

  it('sees all plans', async () => {
    expect(await countRows(db, 'plans')).toBe(PLAN_COUNT);
  });

  it('sees all 12 clients', async () => {
    expect(await countRows(db, 'clients')).toBe(CLIENT_COUNT);
  });

  it('sees every membership across clients', async () => {
    const { data } = await db.from('client_members').select('client_id');
    const clientIds = new Set((data ?? []).map((m) => m.client_id));
    expect(data?.length ?? 0).toBeGreaterThanOrEqual(5);
    expect(clientIds.size).toBeGreaterThanOrEqual(2);
  });

  it('can update any client and the write lands in events as admin', async () => {
    const marker = `Admin test ${Date.now()}`;
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: marker })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    const event = await latestEvent(db, 'clients.update', alpenhausId);
    expect(event).not.toBeNull();
    expect(event?.actor_id).toBe(userId);
    expect(event?.actor_role).toBe('admin');
    expect(event?.client_id).toBe(alpenhausId);
    expect(asRecord(event?.after).contact_name).toBe(marker);
    expect(asRecord(event?.before).contact_name).toBe(originalContact);
  });

  it('can change billing fields that members cannot', async () => {
    const kettle = await clientBySlug(db, KETTLE_SLUG);
    if (!kettle) throw new Error('Seed missing: Kettle & Co');
    const { data, error } = await db
      .from('clients')
      .update({ health: kettle.health })
      .eq('id', kettle.id)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('can write admin_settings and sees the event', async () => {
    const { error: insertError } = await db
      .from('admin_settings')
      .upsert({ key: SETTING_KEY, value: { ok: true, at: Date.now() } });
    expect(insertError).toBeNull();

    const { data: row } = await db.from('admin_settings').select('*').eq('key', SETTING_KEY).single();
    expect(asRecord(row?.value).ok).toBe(true);

    const insertEvent = await latestEvent(db, 'admin_settings.insert', SETTING_KEY);
    expect(insertEvent).not.toBeNull();
    expect(insertEvent?.actor_role).toBe('admin');
    expect(insertEvent?.object_type).toBe('admin_settings');

    const { error: deleteError } = await db.from('admin_settings').delete().eq('key', SETTING_KEY);
    expect(deleteError).toBeNull();

    const deleteEvent = await latestEvent(db, 'admin_settings.delete', SETTING_KEY);
    expect(deleteEvent).not.toBeNull();
    expect(asRecord(deleteEvent?.before).key).toBe(SETTING_KEY);
  });

  it('can update another user profile and sees the event', async () => {
    const { data: anna } = await db.from('profiles').select('*').eq('email', SEED_USERS.owner).single();
    if (!anna) throw new Error('Seed missing: anna@alpenhaus.de');

    const { data, error } = await db
      .from('profiles')
      .update({ full_name: anna.full_name })
      .eq('id', anna.id)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    const event = await latestEvent(db, 'profiles.update', anna.id);
    expect(event).not.toBeNull();
    expect(event?.actor_role).toBe('admin');
    expect(event?.client_id).toBeNull();
  });

  it('cannot remove the last owner of a client either', async () => {
    const kettle = await clientBySlug(db, KETTLE_SLUG);
    if (!kettle) throw new Error('Seed missing: Kettle & Co');
    const { error } = await db
      .from('client_members')
      .delete()
      .eq('client_id', kettle.id)
      .eq('role', 'owner');
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/at least one owner/i);
    expect(await countRows(db, 'client_members')).toBeGreaterThanOrEqual(5);
  });

  it('sees events for every client', async () => {
    const { data } = await db.from('events').select('client_id').not('client_id', 'is', null);
    const clientIds = new Set((data ?? []).map((e) => e.client_id));
    expect(clientIds.size).toBeGreaterThanOrEqual(2);
  });

  it('can call log_event and the row is tagged admin', async () => {
    const { data: id, error } = await db.rpc('log_event', {
      p_client_id: alpenhausId,
      p_action: 'rls_test.admin',
      p_object_type: 'test',
      p_object_id: 'admin',
      p_before: null,
      p_after: { ok: true },
    });
    expect(error).toBeNull();
    expect(typeof id).toBe('number');

    const { data: event } = await db.from('events').select('*').eq('id', id as number).single();
    expect(event?.actor_role).toBe('admin');
    expect(event?.actor_id).toBe(userId);
  });

  it('cannot write events directly even as admin', async () => {
    const { error } = await db
      .from('events')
      .update({ action: 'tampered' } as never)
      .eq('object_id', 'admin');
    expect(error).not.toBeNull();
  });
});

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ALPENHAUS_MEMBER_COUNT,
  ALPENHAUS_SLUG,
  KETTLE_SLUG,
  PLAN_COUNT,
  SEED_USERS,
  asRecord,
  clientBySlug,
  countRows,
  isPermissionError,
  latestEvent,
  raw,
  signIn,
  type Db,
} from './helpers';

describe('RLS: owner (anna@alpenhaus.de)', () => {
  let db: Db;
  let userId: string;
  let alpenhausId: string;
  let originalContact: string | null;
  let originalName: string | null;

  beforeAll(async () => {
    ({ db, userId } = await signIn(SEED_USERS.owner));
    const alpenhaus = await clientBySlug(db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Owner cannot see Alpenhaus Textil; seed missing?');
    alpenhausId = alpenhaus.id;
    originalContact = alpenhaus.contact_name;
    const { data: me } = await db.from('profiles').select('full_name').eq('id', userId).single();
    originalName = me?.full_name ?? null;
  });

  afterAll(async () => {
    await db.from('clients').update({ contact_name: originalContact }).eq('id', alpenhausId);
    await db.from('profiles').update({ full_name: originalName }).eq('id', userId);
    await db.from('client_members').delete().eq('invited_email', 'rls-test-invite@alpenhaus.de');
    await db.auth.signOut();
  });

  // profiles -----------------------------------------------------------------

  it('sees only its own profile', async () => {
    const { data } = await db.from('profiles').select('id, email');
    expect(data).toHaveLength(1);
    expect(data?.[0].id).toBe(userId);
    expect(data?.[0].email).toBe(SEED_USERS.owner);
  });

  it('can update its own full_name', async () => {
    const { data, error } = await db
      .from('profiles')
      .update({ full_name: 'Anna Weber (test)' })
      .eq('id', userId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('cannot set is_admin on its own profile', async () => {
    const { error } = await db.from('profiles').update({ is_admin: true }).eq('id', userId);
    expect(error).not.toBeNull();
    expect(isPermissionError(error)).toBe(true);
    const { data } = await db.from('profiles').select('is_admin').eq('id', userId).single();
    expect(data?.is_admin).toBe(false);
  });

  it('cannot touch other profiles', async () => {
    const { data, error } = await db
      .from('profiles')
      .update({ full_name: 'x' })
      .neq('id', userId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  // plans --------------------------------------------------------------------

  it('can read plans but not change them', async () => {
    expect(await countRows(db, 'plans')).toBe(PLAN_COUNT);

    const { error: insertError } = await db.from('plans').insert({ id: 'rls_test', name: 'x' });
    expect(isPermissionError(insertError)).toBe(true);

    const { data: updated } = await db.from('plans').update({ name: 'x' }).eq('id', 'scale').select();
    expect(updated).toHaveLength(0);

    const { data: deleted } = await db.from('plans').delete().eq('id', 'scale').select();
    expect(deleted).toHaveLength(0);
  });

  // clients ------------------------------------------------------------------

  it('sees exactly one client: Alpenhaus Textil', async () => {
    const { data } = await db.from('clients').select('slug');
    expect(data).toHaveLength(1);
    expect(data?.[0].slug).toBe(ALPENHAUS_SLUG);
  });

  it('can update contact_name and the write lands in events', async () => {
    const marker = `Owner test ${Date.now()}`;
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: marker })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    const event = await latestEvent(db, 'clients.update', alpenhausId);
    expect(event).not.toBeNull();
    expect(event?.object_type).toBe('clients');
    expect(event?.client_id).toBe(alpenhausId);
    expect(event?.actor_id).toBe(userId);
    expect(event?.actor_role).toBe('owner');
    expect(asRecord(event?.after).contact_name).toBe(marker);
  });

  it('cannot change billing or lifecycle fields on the client', async () => {
    const { error } = await db.from('clients').update({ mrr_cents: 0 }).eq('id', alpenhausId);
    expect(error).not.toBeNull();
    expect(isPermissionError(error)).toBe(true);

    const { error: stageError } = await db.from('clients').update({ stage: 'paused' }).eq('id', alpenhausId);
    expect(isPermissionError(stageError)).toBe(true);
  });

  it('cannot insert or delete clients', async () => {
    const { error: insertError } = await db
      .from('clients')
      .insert({ name: 'Owner Made', slug: 'owner-made-rls-test' });
    expect(isPermissionError(insertError)).toBe(true);

    const { data: deleted, error: deleteError } = await db
      .from('clients')
      .delete()
      .eq('id', alpenhausId)
      .select();
    expect(deleteError).toBeNull();
    expect(deleted).toHaveLength(0);
    expect(await clientBySlug(db, ALPENHAUS_SLUG)).not.toBeNull();
  });

  // client_members -----------------------------------------------------------

  it('sees the 4 Alpenhaus members and nobody else', async () => {
    const { data } = await db.from('client_members').select('client_id');
    expect(data).toHaveLength(ALPENHAUS_MEMBER_COUNT);
    expect(data?.every((m) => m.client_id === alpenhausId)).toBe(true);
  });

  it('can invite and remove a member, both logged in events', async () => {
    const { data: inserted, error: insertError } = await db
      .from('client_members')
      .insert({
        client_id: alpenhausId,
        role: 'viewer',
        status: 'invited',
        invited_email: 'rls-test-invite@alpenhaus.de',
      })
      .select()
      .single();
    expect(insertError).toBeNull();
    if (!inserted) throw new Error('insert returned no row');

    const insertEvent = await latestEvent(db, 'client_members.insert', inserted.id);
    expect(insertEvent?.actor_role).toBe('owner');
    expect(insertEvent?.client_id).toBe(alpenhausId);

    const { data: deleted, error: deleteError } = await db
      .from('client_members')
      .delete()
      .eq('id', inserted.id)
      .select();
    expect(deleteError).toBeNull();
    expect(deleted).toHaveLength(1);

    const deleteEvent = await latestEvent(db, 'client_members.delete', inserted.id);
    expect(deleteEvent).not.toBeNull();
    expect(asRecord(deleteEvent?.before).invited_email).toBe('rls-test-invite@alpenhaus.de');
  });

  it('cannot remove itself as the last owner', async () => {
    const { error } = await db
      .from('client_members')
      .delete()
      .eq('client_id', alpenhausId)
      .eq('user_id', userId);
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/at least one owner/i);

    const { error: demoteError } = await db
      .from('client_members')
      .update({ role: 'viewer' })
      .eq('client_id', alpenhausId)
      .eq('user_id', userId);
    expect(demoteError?.message).toMatch(/at least one owner/i);

    expect(await countRows(db, 'client_members')).toBe(ALPENHAUS_MEMBER_COUNT);
  });

  it('cannot add members to another client', async () => {
    const { data: kettleFromOwner } = await db.from('clients').select('id').eq('slug', KETTLE_SLUG);
    expect(kettleFromOwner).toHaveLength(0);

    // Use a random client id: the insert policy must refuse it regardless.
    const { error } = await db.from('client_members').insert({
      client_id: '00000000-0000-4000-8000-00000000ffff',
      role: 'owner',
      invited_email: 'rls-test-foreign@example.com',
    });
    expect(error).not.toBeNull();
  });

  // admin_settings -----------------------------------------------------------

  it('cannot see or write admin_settings', async () => {
    expect(await countRows(db, 'admin_settings')).toBe(0);
    const { error } = await db.from('admin_settings').insert({ key: 'rls_test.owner', value: {} });
    expect(isPermissionError(error)).toBe(true);
  });

  // events -------------------------------------------------------------------

  it('sees only Alpenhaus events', async () => {
    const { data } = await db.from('events').select('client_id');
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.every((e) => e.client_id === alpenhausId)).toBe(true);
  });

  it('cannot write events directly', async () => {
    const { error } = await raw(db).from('events').insert({
      action: 'tampered',
      object_type: 'test',
      client_id: alpenhausId,
    });
    expect(error).not.toBeNull();
  });

  it('can call log_event for its client', async () => {
    const { data: id, error } = await db.rpc('log_event', {
      p_client_id: alpenhausId,
      p_action: 'rls_test.owner',
      p_object_type: 'test',
      p_object_id: 'owner',
      p_before: null,
      p_after: null,
    });
    expect(error).toBeNull();
    const { data: event } = await db.from('events').select('*').eq('id', id as number).single();
    expect(event?.actor_role).toBe('owner');
  });
});

describe('RLS: cross-client owner (owner@kettle.co)', () => {
  let db: Db;
  let alpenhausId: string;

  beforeAll(async () => {
    // Anna looks up the Alpenhaus id; the Kettle owner must not reach it.
    const anna = await signIn(SEED_USERS.owner);
    const alpenhaus = await clientBySlug(anna.db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Seed missing: Alpenhaus Textil');
    alpenhausId = alpenhaus.id;
    await anna.db.auth.signOut();

    ({ db } = await signIn(SEED_USERS.kettleOwner));
  });

  afterAll(async () => {
    await db.auth.signOut();
  });

  it('sees only Kettle & Co', async () => {
    const { data } = await db.from('clients').select('slug');
    expect(data).toHaveLength(1);
    expect(data?.[0].slug).toBe(KETTLE_SLUG);
  });

  it('cannot see Alpenhaus rows or members', async () => {
    const { data: clients } = await db.from('clients').select('id').eq('id', alpenhausId);
    expect(clients).toHaveLength(0);

    const { data: members } = await db.from('client_members').select('id').eq('client_id', alpenhausId);
    expect(members).toHaveLength(0);

    const { data: events } = await db.from('events').select('id').eq('client_id', alpenhausId);
    expect(events).toHaveLength(0);
  });

  it('cannot update Alpenhaus', async () => {
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: 'Kettle was here' })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it('sees only its own membership', async () => {
    const { data } = await db.from('client_members').select('role, client_id');
    expect(data).toHaveLength(1);
    expect(data?.[0].role).toBe('owner');
    expect(data?.[0].client_id).not.toBe(alpenhausId);
  });
});

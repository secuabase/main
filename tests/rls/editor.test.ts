import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ALPENHAUS_MEMBER_COUNT,
  ALPENHAUS_SLUG,
  PLAN_COUNT,
  SEED_USERS,
  asRecord,
  clientBySlug,
  countRows,
  isPermissionError,
  latestEvent,
  signIn,
  type Db,
} from './helpers';

describe('RLS: editor (editor@alpenhaus.de)', () => {
  let db: Db;
  let userId: string;
  let alpenhausId: string;
  let originalContact: string | null;
  let viewerMemberId: string;

  beforeAll(async () => {
    ({ db, userId } = await signIn(SEED_USERS.editor));
    const alpenhaus = await clientBySlug(db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Editor cannot see Alpenhaus Textil; seed missing?');
    alpenhausId = alpenhaus.id;
    originalContact = alpenhaus.contact_name;
    const { data: viewer } = await db
      .from('client_members')
      .select('id')
      .eq('client_id', alpenhausId)
      .eq('role', 'viewer')
      .single();
    if (!viewer) throw new Error('Seed missing: Alpenhaus viewer membership');
    viewerMemberId = viewer.id;
  });

  afterAll(async () => {
    await db.from('clients').update({ contact_name: originalContact }).eq('id', alpenhausId);
    await db.auth.signOut();
  });

  it('sees only its own profile', async () => {
    const { data } = await db.from('profiles').select('id');
    expect(data).toHaveLength(1);
    expect(data?.[0].id).toBe(userId);
  });

  it('cannot set is_admin', async () => {
    const { error } = await db.from('profiles').update({ is_admin: true }).eq('id', userId);
    expect(isPermissionError(error)).toBe(true);
  });

  it('reads plans, cannot change them', async () => {
    expect(await countRows(db, 'plans')).toBe(PLAN_COUNT);
    const { error } = await db.from('plans').insert({ id: 'rls_test_editor' });
    expect(isPermissionError(error)).toBe(true);
  });

  it('sees only Alpenhaus', async () => {
    const { data } = await db.from('clients').select('slug');
    expect(data).toHaveLength(1);
    expect(data?.[0].slug).toBe(ALPENHAUS_SLUG);
  });

  it('can update contact_name and the write lands in events as editor', async () => {
    const marker = `Editor test ${Date.now()}`;
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: marker })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(1);

    const event = await latestEvent(db, 'clients.update', alpenhausId);
    expect(event?.actor_id).toBe(userId);
    expect(event?.actor_role).toBe('editor');
    expect(asRecord(event?.after).contact_name).toBe(marker);
  });

  it('cannot change plan or stage', async () => {
    const { error } = await db.from('clients').update({ plan_id: 'scale' }).eq('id', alpenhausId);
    expect(isPermissionError(error)).toBe(true);
  });

  it('cannot insert or delete clients', async () => {
    const { error } = await db.from('clients').insert({ name: 'Editor Made', slug: 'editor-made-rls-test' });
    expect(isPermissionError(error)).toBe(true);
    const { data } = await db.from('clients').delete().eq('id', alpenhausId).select();
    expect(data).toHaveLength(0);
  });

  it('sees the 4 Alpenhaus members', async () => {
    const { data } = await db.from('client_members').select('client_id');
    expect(data).toHaveLength(ALPENHAUS_MEMBER_COUNT);
    expect(data?.every((m) => m.client_id === alpenhausId)).toBe(true);
  });

  it('cannot manage members', async () => {
    const { error: insertError } = await db.from('client_members').insert({
      client_id: alpenhausId,
      role: 'viewer',
      status: 'invited',
      invited_email: 'rls-test-editor@alpenhaus.de',
    });
    expect(isPermissionError(insertError)).toBe(true);

    const { data: updated, error: updateError } = await db
      .from('client_members')
      .update({ role: 'editor' })
      .eq('id', viewerMemberId)
      .select();
    expect(updateError).toBeNull();
    expect(updated).toHaveLength(0);

    const { data: deleted, error: deleteError } = await db
      .from('client_members')
      .delete()
      .eq('id', viewerMemberId)
      .select();
    expect(deleteError).toBeNull();
    expect(deleted).toHaveLength(0);

    expect(await countRows(db, 'client_members')).toBe(ALPENHAUS_MEMBER_COUNT);
  });

  it('cannot see or write admin_settings', async () => {
    expect(await countRows(db, 'admin_settings')).toBe(0);
    const { error } = await db.from('admin_settings').insert({ key: 'rls_test.editor', value: {} });
    expect(isPermissionError(error)).toBe(true);
  });

  it('sees only Alpenhaus events', async () => {
    const { data } = await db.from('events').select('client_id');
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.every((e) => e.client_id === alpenhausId)).toBe(true);
  });
});

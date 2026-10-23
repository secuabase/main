import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ALPENHAUS_MEMBER_COUNT,
  ALPENHAUS_SLUG,
  PLAN_COUNT,
  SEED_USERS,
  clientBySlug,
  countRows,
  isPermissionError,
  raw,
  signIn,
  type Db,
} from './helpers';

describe('RLS: viewer (viewer@alpenhaus.de)', () => {
  let db: Db;
  let userId: string;
  let alpenhausId: string;
  let originalContact: string | null;

  beforeAll(async () => {
    ({ db, userId } = await signIn(SEED_USERS.viewer));
    const alpenhaus = await clientBySlug(db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Viewer cannot see Alpenhaus Textil; seed missing?');
    alpenhausId = alpenhaus.id;
    originalContact = alpenhaus.contact_name;
  });

  afterAll(async () => {
    await db.auth.signOut();
  });

  it('sees only its own profile and cannot become admin', async () => {
    const { data } = await db.from('profiles').select('id');
    expect(data).toHaveLength(1);
    expect(data?.[0].id).toBe(userId);
    const { error } = await db.from('profiles').update({ is_admin: true }).eq('id', userId);
    expect(isPermissionError(error)).toBe(true);
  });

  it('reads plans, cannot change them', async () => {
    expect(await countRows(db, 'plans')).toBe(PLAN_COUNT);
    const { data } = await db.from('plans').update({ name: 'x' }).eq('id', 'scale').select();
    expect(data).toHaveLength(0);
  });

  it('sees only Alpenhaus', async () => {
    const { data } = await db.from('clients').select('slug');
    expect(data).toHaveLength(1);
    expect(data?.[0].slug).toBe(ALPENHAUS_SLUG);
  });

  it('cannot update the client', async () => {
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: 'Viewer was here' })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(0);

    const after = await clientBySlug(db, ALPENHAUS_SLUG);
    expect(after?.contact_name).toBe(originalContact);
  });

  it('cannot insert or delete clients', async () => {
    const { error } = await db.from('clients').insert({ name: 'Viewer Made', slug: 'viewer-made-rls-test' });
    expect(isPermissionError(error)).toBe(true);
    const { data } = await db.from('clients').delete().eq('id', alpenhausId).select();
    expect(data).toHaveLength(0);
  });

  it('sees the 4 Alpenhaus members but cannot manage them', async () => {
    const { data } = await db.from('client_members').select('client_id, role');
    expect(data).toHaveLength(ALPENHAUS_MEMBER_COUNT);
    expect(data?.every((m) => m.client_id === alpenhausId)).toBe(true);

    const { error } = await db.from('client_members').insert({
      client_id: alpenhausId,
      role: 'viewer',
      status: 'invited',
      invited_email: 'rls-test-viewer@alpenhaus.de',
    });
    expect(isPermissionError(error)).toBe(true);

    const { data: deleted } = await db.from('client_members').delete().eq('client_id', alpenhausId).select();
    expect(deleted).toHaveLength(0);
  });

  it('cannot see or write admin_settings', async () => {
    expect(await countRows(db, 'admin_settings')).toBe(0);
    const { error } = await db.from('admin_settings').insert({ key: 'rls_test.viewer', value: {} });
    expect(isPermissionError(error)).toBe(true);
  });

  it('can read Alpenhaus events but not write them', async () => {
    const { data } = await db.from('events').select('client_id');
    expect(data?.length ?? 0).toBeGreaterThan(0);
    expect(data?.every((e) => e.client_id === alpenhausId)).toBe(true);

    const { error } = await raw(db).from('events').insert({ action: 'tampered', object_type: 'test' });
    expect(error).not.toBeNull();
  });
});

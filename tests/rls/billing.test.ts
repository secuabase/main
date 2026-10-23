import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  ALPENHAUS_MEMBER_COUNT,
  ALPENHAUS_SLUG,
  PLAN_COUNT,
  SEED_USERS,
  clientBySlug,
  countRows,
  isPermissionError,
  signIn,
  type Db,
} from './helpers';

describe('RLS: billing (billing@alpenhaus.de)', () => {
  let db: Db;
  let userId: string;
  let alpenhausId: string;
  let originalContact: string | null;

  beforeAll(async () => {
    ({ db, userId } = await signIn(SEED_USERS.billing));
    const alpenhaus = await clientBySlug(db, ALPENHAUS_SLUG);
    if (!alpenhaus) throw new Error('Billing cannot see Alpenhaus Textil; seed missing?');
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
    const { error } = await db.from('plans').delete().eq('id', 'scale');
    // Delete with no matching policy row returns no error and no rows.
    expect(error).toBeNull();
    expect(await countRows(db, 'plans')).toBe(PLAN_COUNT);
  });

  it('sees only Alpenhaus', async () => {
    const { data } = await db.from('clients').select('slug');
    expect(data).toHaveLength(1);
    expect(data?.[0].slug).toBe(ALPENHAUS_SLUG);
  });

  it('cannot update the client', async () => {
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: 'Billing was here' })
      .eq('id', alpenhausId)
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
    const after = await clientBySlug(db, ALPENHAUS_SLUG);
    expect(after?.contact_name).toBe(originalContact);
  });

  it('cannot insert or delete clients', async () => {
    const { error } = await db.from('clients').insert({ name: 'Billing Made', slug: 'billing-made-rls-test' });
    expect(isPermissionError(error)).toBe(true);
    const { data } = await db.from('clients').delete().eq('id', alpenhausId).select();
    expect(data).toHaveLength(0);
  });

  it('sees the 4 Alpenhaus members but cannot manage them', async () => {
    const { data } = await db.from('client_members').select('client_id');
    expect(data).toHaveLength(ALPENHAUS_MEMBER_COUNT);
    expect(data?.every((m) => m.client_id === alpenhausId)).toBe(true);

    const { error } = await db.from('client_members').insert({
      client_id: alpenhausId,
      role: 'viewer',
      status: 'invited',
      invited_email: 'rls-test-billing@alpenhaus.de',
    });
    expect(isPermissionError(error)).toBe(true);
  });

  it('cannot see or write admin_settings', async () => {
    expect(await countRows(db, 'admin_settings')).toBe(0);
    const { error } = await db.from('admin_settings').insert({ key: 'rls_test.billing', value: {} });
    expect(isPermissionError(error)).toBe(true);
  });

  it('sees no events (billing is not in the events policy)', async () => {
    expect(await countRows(db, 'events')).toBe(0);
  });
});

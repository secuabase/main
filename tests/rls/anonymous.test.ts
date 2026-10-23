import { describe, expect, it } from 'vitest';
import { TABLES, anonClient, countRows, raw } from './helpers';

describe('RLS: anonymous (publishable key, no session)', () => {
  const db = anonClient();

  it.each(TABLES)('sees no rows in %s', async (table) => {
    expect(await countRows(db, table)).toBe(0);
  });

  it('cannot insert a client', async () => {
    const { error } = await db.from('clients').insert({ name: 'Anon', slug: 'anon-rls-test' });
    expect(error).not.toBeNull();
  });

  it('cannot insert a profile', async () => {
    const { error } = await db.from('profiles').insert({
      id: '00000000-0000-4000-8000-00000000eeee',
      email: 'anon@example.com',
    });
    expect(error).not.toBeNull();
  });

  it('cannot update clients (zero rows)', async () => {
    const { data, error } = await db
      .from('clients')
      .update({ contact_name: 'anon' })
      .eq('slug', 'alpenhaus-textil')
      .select();
    expect(error).toBeNull();
    expect(data).toHaveLength(0);
  });

  it('cannot write events', async () => {
    const { error } = await raw(db).from('events').insert({ action: 'anon', object_type: 'test' });
    expect(error).not.toBeNull();
  });

  it('cannot call log_event', async () => {
    const { error } = await db.rpc('log_event', {
      p_client_id: null,
      p_action: 'anon.attempt',
      p_object_type: 'test',
      p_object_id: null,
      p_before: null,
      p_after: null,
    });
    expect(error).not.toBeNull();
    expect(error?.message).toMatch(/permission denied/i);
  });

  it('cannot call the helper functions', async () => {
    const { error } = await db.rpc('is_admin');
    expect(error).not.toBeNull();
  });
});

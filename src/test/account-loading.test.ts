import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/opportunities.functions', () => ({ getPublicOpportunities: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => {
  const query = (table: string) => {
    const result = { data: table === 'profiles' ? { full_name: 'Demo Admin', organisation: '', email: 'admin@example.test' } : table === 'user_roles' ? { role: 'admin' } : [], error: null };
    return { eq: () => query(table), single: async () => result, order: async () => result, then: (resolve: (value: typeof result) => unknown) => Promise.resolve(result).then(resolve) };
  };
  return { supabase: { auth: { getUser: async () => ({ data: { user: { id: 'demo-admin', email: 'admin@example.test' } }, error: null }), signInWithPassword: async () => ({ error: null }) }, from: query } };
});

import { actions, clearAccount, refreshData } from '@/lib/store';

describe('Account loading', () => {
  it('returns the admin after login overlaps an identity-change refresh', async () => {
    clearAccount();
    const login = actions.login('admin@example.test', 'test-password');
    const identityRefresh = refreshData();
    const user = await login;
    await identityRefresh;
    expect(user).toMatchObject({ id: 'demo-admin', role: 'admin' });
  });
});
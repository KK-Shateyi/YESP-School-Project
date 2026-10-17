import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/reset-password')({ head: () => pageHead('Reset password – YESP', 'Choose and confirm a new password using your YESP recovery link.'), component: ResetPassword });
function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [checked, setChecked] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    async function verify() {
      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.slice(1));
      const tokenHash = url.searchParams.get('token_hash');
      let valid = false;
      if (tokenHash && url.searchParams.get('type') === 'recovery') {
        const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' });valid = !error;
      } else if (hash.get('type') === 'recovery') {
        const access = hash.get('access_token');const refresh = hash.get('refresh_token');
        if (access && refresh) { const { error } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });valid = !error; }
        else { const { data } = await supabase.auth.getSession();valid = Boolean(data.session); }
      }
      if (valid) window.history.replaceState(null, '', '/reset-password');
      setReady(valid);setChecked(true);
    }
    void verify().catch(() => setChecked(true));
  }, []);
  if (!checked) return <p role="status" className="p-12 text-center">Checking recovery link…</p>;
  if (!ready) return <div className="mx-auto max-w-md px-4 py-12"><h1 className="text-2xl font-bold">Invalid or expired link</h1><p className="my-4">Request a new recovery link to reset your password.</p><Button asChild><Link to="/forgot-password">Request a new link</Link></Button></div>;
  return <div className="mx-auto max-w-md px-4 py-12"><form className="card space-y-4 p-6" onSubmit={async e => {
    e.preventDefault();if(password.length < 6)return setMessage('Password must be at least 6 characters.');if(password !== confirm)return setMessage('Passwords do not match.');
    setBusy(true);const { error } = await supabase.auth.updateUser({ password });setBusy(false);setDone(!error);setMessage(error ? 'Password could not be updated. Request a new link and try again.' : 'Password updated successfully.');
  }}><h1 className="text-2xl font-bold">Set a new password</h1>{!done && <><label className="label" htmlFor="new-password">New password *</label><input id="new-password" className="field" autoComplete="new-password" type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} /><label className="label" htmlFor="confirm-password">Confirm password *</label><input id="confirm-password" className="field" autoComplete="new-password" type="password" required value={confirm} onChange={e=>setConfirm(e.target.value)} /><Button disabled={busy}>{busy ? 'Saving…' : 'Save password'}</Button></>}{message && <p role="status">{message}</p>}{done && <Link to="/login" className="text-gold-deep">Back to login</Link>}</form></div>;
}
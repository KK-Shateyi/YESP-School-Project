import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/forgot-password')({ head: () => pageHead('Forgot password – YESP', 'Request a secure password recovery link for your YESP account.'), component: ForgotPassword });
function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  return <div className="mx-auto max-w-md px-4 py-12"><form className="card space-y-4 p-6" onSubmit={async e => {
    e.preventDefault();setBusy(true);setMessage('');
    try { const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      setMessage(error ? 'The request could not be processed. Please try again later or contact YESP.' : 'If this email is registered, a recovery link will be sent. Check your inbox and spam folder.');
    } catch { setMessage('The request could not be processed. Please try again later.'); } finally { setBusy(false); }
  }}><h1 className="text-2xl font-bold">Forgot password</h1><label className="label" htmlFor="recovery-email">Email address *</label><input className="field" id="recovery-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} /><Button className="w-full" disabled={busy}>{busy ? 'Requesting…' : 'Request reset link'}</Button>{message && <p role="status" className="text-sm">{message}</p>}<Link to="/login" className="block text-sm text-gold-deep">Back to login</Link></form></div>;
}
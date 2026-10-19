import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { actions, dashboardPath } from "@/lib/store";
import { Button } from '@/components/ui/button';

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login – YESP" },
      { name: "description", content: "Sign in to YESP as a youth, employer or administrator." },
      { property: "og:title", content: "Login – YESP" },
      { property: "og:description", content: "Sign in to your YESP account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Login,
});

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);setError('');
    const r = await actions.login(email, password);
    setBusy(false);
    if (typeof r === "string") return setError(r);
    navigate({ to: dashboardPath(r.role) });
  };
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="text-2xl font-extrabold">Login</h1>
        <div><label htmlFor="login-email" className="label">Email</label><input id="login-email" autoComplete="email" className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label htmlFor="login-password" className="label">Password</label><input id="login-password" autoComplete="current-password" className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        <Link to="/forgot-password" className="block text-sm font-semibold text-gold-deep">Forgot Password?</Link>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button disabled={busy} className="w-full">{busy ? 'Signing in…' : 'Login'}</Button>
        <p className="text-center text-sm text-muted-foreground">No account? <Link to="/register" className="font-semibold text-gold-deep">Register</Link></p>
      </form>
      <section aria-labelledby="demo-accounts-title" className="mt-8 space-y-4">
        <div>
          <h2 id="demo-accounts-title" className="text-xl font-bold">Demo login accounts</h2>
          <p className="mt-1 text-sm text-muted-foreground">Public test accounts with synthetic data only. Do not enter personal information.</p>
        </div>
        {[
          { role: 'Administrator', email: 'admin@yesp.co.za', password: 'YESP-Admin-Demo-2026!' },
          { role: 'Youth', email: 'thabo@demo.co.za', password: 'YESP-Youth-Demo-2026!' },
          { role: 'Employer', email: 'employer@techhub.co.za', password: 'YESP-Employer-Demo-2026!' },
          { role: 'Training Provider', email: 'training@ubuntu.co.za', password: 'YESP-Employer-Demo-2026!' },
        ].map((account) => (
          <article key={account.email} className="card space-y-3 p-4">
            <h3 className="font-bold">{account.role}</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="font-semibold">Email</dt><dd className="break-all select-all">{account.email}</dd></div>
              <div><dt className="font-semibold">Password</dt><dd className="break-all font-mono select-all">{account.password}</dd></div>
            </dl>
            <Button type="button" variant="outline" disabled={busy} className="w-full" onClick={() => {
              setEmail(account.email);
              setPassword(account.password);
              setError('');
              document.getElementById('login-email')?.focus();
            }}>Use {account.role} account</Button>
          </article>
        ))}
      </section>
    </div>
  );
}

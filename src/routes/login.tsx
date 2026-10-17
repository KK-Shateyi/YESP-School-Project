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
    </div>
  );
}

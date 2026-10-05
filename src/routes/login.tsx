import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { actions, dashboardPath } from "@/lib/store";

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

const demo: [string, string, string][] = [
  ["Youth", "thabo@demo.co.za", "youth123"],
  ["Employer", "employer@techhub.co.za", "employer123"],
  ["Admin", "admin@yesp.co.za", "admin123"],
];

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = actions.login(email, password);
    if (typeof r === "string") return setError(r);
    navigate({ to: dashboardPath(r.role) });
  };
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="text-2xl font-extrabold">Login</h1>
        <div><label className="label">Email</label><input className="field" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        <div><label className="label">Password</label><input className="field" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="btn btn-gold w-full">Login</button>
        <p className="text-center text-sm text-muted-foreground">No account? <Link to="/register" className="font-semibold text-gold-deep">Register</Link></p>
      </form>
      <div className="mt-6 rounded-xl border border-dashed p-4">
        <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">Demo accounts (tap to fill)</p>
        <div className="grid gap-2">
          {demo.map(([r, e, p]) => (
            <button key={r} type="button" onClick={() => { setEmail(e); setPassword(p); setError(""); }} className="flex justify-between rounded-md bg-muted px-3 py-2 text-left text-sm hover:bg-gold-soft">
              <span className="font-semibold">{r}</span><span className="text-muted-foreground">{e}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

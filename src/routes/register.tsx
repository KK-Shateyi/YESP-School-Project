import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { actions, type Role } from "@/lib/store";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Register – YESP" },
      { name: "description", content: "Create a YESP account as a youth or an employer/training provider." },
      { property: "og:title", content: "Register – YESP" },
      { property: "og:description", content: "Join YESP and start finding opportunities." },
    ],
  }),
  component: Register,
});

function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("youth");
  const [f, setF] = useState({ name: "", email: "", password: "", organisation: "" });
  const [error, setError] = useState("");
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (f.password.length < 6) return setError("Password must be at least 6 characters.");
    const r = actions.register({ name: f.name, email: f.email, password: f.password, role, organisation: role === "employer" ? f.organisation : undefined });
    if (typeof r === "string") return setError(r);
    navigate({ to: role === "youth" ? "/youth" : "/employer" });
  };
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <form onSubmit={submit} className="card space-y-4 p-6">
        <h1 className="text-2xl font-extrabold">Create an account</h1>
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
          {(["youth", "employer"] as Role[]).map((r) => (
            <button type="button" key={r} onClick={() => setRole(r)} className={`rounded-md py-2 text-sm font-semibold ${role === r ? "bg-ink text-ink-foreground" : "text-muted-foreground"}`}>
              {r === "youth" ? "Youth" : "Employer / Provider"}
            </button>
          ))}
        </div>
        <div><label className="label">{role === "youth" ? "Full name" : "Contact person"}</label><input className="field" required value={f.name} onChange={set("name")} /></div>
        {role === "employer" && <div><label className="label">Organisation name</label><input className="field" required value={f.organisation} onChange={set("organisation")} /></div>}
        <div><label className="label">Email</label><input className="field" type="email" required value={f.email} onChange={set("email")} /></div>
        <div><label className="label">Password</label><input className="field" type="password" required value={f.password} onChange={set("password")} /></div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button className="btn btn-gold w-full">Register</button>
        <p className="text-center text-sm text-muted-foreground">Already registered? <Link to="/login" className="font-semibold text-gold-deep">Login</Link></p>
        <p className="text-center text-xs text-muted-foreground">Administrator accounts are created by YESP only.</p>
      </form>
    </div>
  );
}

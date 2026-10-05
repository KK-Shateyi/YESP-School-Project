import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser, type OppStatus, type Opportunity, type Role } from "@/lib/store";

export function StatusBadge({ status }: { status: OppStatus | string }) {
  const map: Record<string, [string, string]> = {
    pending: ["Pending Approval", "bg-warning-soft text-gold-deep"],
    approved: ["Approved", "bg-success-soft text-success"],
    rejected: ["Rejected", "bg-danger-soft text-destructive"],
    Submitted: ["Submitted", "bg-gold-soft text-gold-deep"],
  };
  const [label, cls] = map[status] ?? [status, "bg-muted text-muted-foreground"];
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>;
}

export function TypeTag({ type }: { type: string }) {
  return <span className="inline-block rounded-md bg-ink px-2 py-0.5 text-xs font-semibold text-ink-foreground">{type}</span>;
}

export function OppCard({ o }: { o: Opportunity }) {
  return (
    <Link to="/opportunities/$id" params={{ id: o.id }} className="card block p-5 transition hover:border-primary">
      <div className="mb-2 flex items-center gap-2"><TypeTag type={o.type} /><span className="text-xs text-muted-foreground">{o.category}</span></div>
      <h3 className="text-lg font-bold leading-snug">{o.title}</h3>
      <p className="text-sm text-muted-foreground">{o.organisation}</p>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <span>📍 {o.location}</span><span>⏳ Closes {o.closingDate}</span>
      </div>
    </Link>
  );
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const user = useCurrentUser();
  const navigate = useNavigate();
  useEffect(() => {
    const t = setTimeout(() => { if (!user) navigate({ to: "/login" }); }, 50);
    return () => clearTimeout(t);
  }, [user, navigate]);
  if (!user) return <div className="p-10 text-center text-muted-foreground">Checking access…</div>;
  if (user.role !== role)
    return <div className="mx-auto max-w-md p-10 text-center"><h1 className="text-xl font-bold">Access restricted</h1><p className="mt-2 text-muted-foreground">This area is for {role} accounts only.</p></div>;
  return <>{children}</>;
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string | undefined; children?: ReactNode }) {
  return (
    <div className="border-b bg-muted">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0"><h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>{sub && <p className="mt-1 text-muted-foreground">{sub}</p>}</div>
        {children}
      </div>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, RequireRole, StatusBadge, TypeTag } from "@/components/ui-bits";
import { actions, useDB, type OppStatus } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard – YESP" },
      { name: "description", content: "Review, approve or reject submitted opportunities on YESP." },
      { property: "og:title", content: "Admin Dashboard – YESP" },
      { property: "og:description", content: "Moderate opportunities before they reach youth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <RequireRole role="admin"><Admin /></RequireRole>,
});

function Admin() {
  const db = useDB();
  const [tab, setTab] = useState<OppStatus>("pending");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const list = db.opps.filter((o) => o.status === tab);
  const sel = db.opps.find((o) => o.id === openId);
  const count = (s: OppStatus) => db.opps.filter((o) => o.status === s).length;
  const select = (id: string | null) => { setOpenId(id); setReason(""); setError(""); };
  const review = async (status: "approved" | "rejected") => {
    if (!sel || busy) return;
    setBusy(true); setError("");
    try { await actions.setStatus(sel.id, status, reason); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to review this listing. Please try again."); }
    finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader title="Administrator Dashboard" sub="Only approved opportunities are visible to youth." />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["pending", "approved", "rejected"] as OppStatus[]).map((s) => (
            <Button variant="ghost" disabled={busy} key={s} onClick={() => { setTab(s); select(null); }} className={`card h-auto block p-4 text-left ${tab === s ? "!border-primary ring-2 ring-primary" : ""}`}>
              <p className="text-xs capitalize text-muted-foreground">{s}</p><p className="text-3xl font-black">{count(s)}</p>
            </Button>
          ))}
          <div className="card p-4"><p className="text-xs text-muted-foreground">Applications</p><p className="text-3xl font-black">{db.apps.length}</p></div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="card p-4">
            <h2 className="mb-2 px-2 font-bold capitalize">{tab === "pending" ? "Pending opportunities" : `${tab} opportunities`}</h2>
            {list.length === 0 ? <p className="p-2 text-sm text-muted-foreground">Nothing here.</p> : (
              <ul className="space-y-1">
                {list.map((o) => (
                  <li key={o.id}>
                     <Button variant="ghost" disabled={busy} onClick={() => select(o.id)} className={`h-auto block w-full rounded-lg p-3 text-left hover:bg-muted ${openId === o.id ? "bg-gold-soft" : ""}`}>
                      <div className="flex items-center justify-between gap-2"><span className="truncate font-semibold">{o.title}</span><StatusBadge status={o.status} /></div>
                      <p className="text-xs text-muted-foreground">{o.organisation} · {o.createdAt}</p>
                     </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            {!sel ? <p className="text-muted-foreground">Select an opportunity to review its details.</p> : (
              <>
                <div className="flex flex-wrap items-center gap-2"><TypeTag type={sel.type} /><span className="text-sm text-muted-foreground">{sel.category}</span><StatusBadge status={sel.status} /></div>
                <h2 className="mt-2 text-2xl font-black">{sel.title}</h2>
                <p className="text-muted-foreground">{sel.organisation}</p>
                <dl className="mt-4 grid grid-cols-2 gap-2 rounded-lg bg-muted p-3 text-sm">
                  <div><dt className="font-semibold">Location</dt><dd>{sel.location}</dd></div>
                  <div><dt className="font-semibold">Closing date</dt><dd>{sel.closingDate}</dd></div>
                </dl>
                <h3 className="mt-4 font-bold">Description</h3><p className="text-sm text-muted-foreground">{sel.description}</p>
                <h3 className="mt-4 font-bold">Requirements</h3>
                <ul className="list-inside list-disc text-sm text-muted-foreground">{sel.requirements.split("\n").filter(Boolean).map((r) => <li key={r}>{r}</li>)}</ul>
                 {sel.status === "pending" && <div className="mt-4"><label htmlFor="rejection-reason" className="label">Rejection reason</label><textarea id="rejection-reason" className="field" value={reason} onChange={(e) => setReason(e.target.value)} /></div>}
                 {sel.status === "rejected" && <p className="mt-4 text-sm"><b>Rejection reason:</b> {sel.rejectionReason}</p>}
                 {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
                 <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
                   {sel.status === "pending" && <Button disabled={busy} onClick={() => review("approved")}>✓ Approve</Button>}
                   {sel.status === "pending" && <Button variant="secondary" disabled={busy} onClick={() => review("rejected")}>✕ Reject</Button>}
                  {sel.status === "approved" && <Link to="/opportunities/$id" params={{ id: sel.id }} className="btn btn-outline">View public listing</Link>}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

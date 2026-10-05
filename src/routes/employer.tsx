import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, RequireRole, StatusBadge, TypeTag } from "@/components/ui-bits";
import { actions, CATEGORIES, LOCATIONS, OPP_TYPES, useCurrentUser, useDB, type OppType } from "@/lib/store";

export const Route = createFileRoute("/employer")({
  head: () => ({
    meta: [
      { title: "Employer Dashboard – YESP" },
      { name: "description", content: "Create opportunities and track their approval status on YESP." },
      { property: "og:title", content: "Employer Dashboard – YESP" },
      { property: "og:description", content: "Post opportunities for South African youth." },
    ],
  }),
  component: () => <RequireRole role="employer"><Employer /></RequireRole>,
});

function Employer() {
  const user = useCurrentUser()!;
  const db = useDB();
  const mine = db.opps.filter((o) => o.employerId === user.id);
  const blank = { organisation: user.organisation ?? "", title: "", type: "Internship" as OppType, location: "Johannesburg", category: "ICT", description: "", requirements: "", closingDate: "" };
  const [f, setF] = useState(blank);
  const [show, setShow] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const count = (s: string) => mine.filter((o) => o.status === s).length;

  return (
    <>
      <PageHeader title="Employer Dashboard" sub={user.organisation}>
        <button className="btn btn-gold" onClick={() => { setShow(true); setDone(false); }}>+ Create opportunity</button>
      </PageHeader>
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="grid grid-cols-3 gap-3">
          {[["Pending", "pending"], ["Approved", "approved"], ["Rejected", "rejected"]].map(([l, s]) => (
            <div key={s} className="card p-4"><p className="text-xs text-muted-foreground">{l}</p><p className="text-3xl font-black">{count(s)}</p></div>
          ))}
        </div>

        {done && <div className="rounded-lg border border-primary bg-gold-soft p-4 text-sm"><b>Submitted for approval.</b> Status is now <StatusBadge status="pending" />. It will be visible to youth once an administrator approves it.</div>}

        {show && (
          <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); actions.createOpp({ ...f, employerId: user.id }); setF(blank); setShow(false); setDone(true); }}>
            <h2 className="text-xl font-bold">Create opportunity</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="label">Organisation name</label><input className="field" required value={f.organisation} onChange={set("organisation")} /></div>
              <div><label className="label">Opportunity title</label><input className="field" required placeholder="e.g. Junior Web Developer Internship" value={f.title} onChange={set("title")} /></div>
              <div><label className="label">Opportunity type</label><select className="field" value={f.type} onChange={set("type")}>{OPP_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Category</label><select className="field" value={f.category} onChange={set("category")}>{CATEGORIES.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Location</label><select className="field" value={f.location} onChange={set("location")}>{LOCATIONS.map((t) => <option key={t}>{t}</option>)}</select></div>
              <div><label className="label">Closing date</label><input className="field" type="date" required value={f.closingDate} onChange={set("closingDate")} /></div>
            </div>
            <div><label className="label">Description</label><textarea className="field min-h-24" required value={f.description} onChange={set("description")} /></div>
            <div><label className="label">Requirements (one per line)</label><textarea className="field min-h-24" required value={f.requirements} onChange={set("requirements")} /></div>
            <div className="flex flex-wrap gap-3">
              <button className="btn btn-gold">Submit for approval</button>
              <button type="button" className="btn btn-outline" onClick={() => setShow(false)}>Cancel</button>
              <button type="button" className="btn btn-outline ml-auto text-xs" onClick={() => setF({ ...f, title: "Junior Web Developer Internship", type: "Internship", category: "ICT", location: "Johannesburg", closingDate: "2026-12-15",
                description: "12-month paid internship building websites and web apps with our development team using HTML, CSS, JavaScript and React.",
                requirements: "Diploma or degree in IT / Computer Science\nBasic HTML, CSS and JavaScript\nAged 18–35\nEager to learn" })}>Fill demo data</button>
            </div>
          </form>
        )}

        <div className="card p-6">
          <h2 className="text-xl font-bold">My submitted opportunities</h2>
          {mine.length === 0 ? <p className="mt-3 text-sm text-muted-foreground">No opportunities yet.</p> : (
            <ul className="mt-4 divide-y">
              {mine.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <Link to="/opportunities/$id" params={{ id: o.id }} className="block truncate font-semibold hover:text-gold-deep">{o.title}</Link>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground"><TypeTag type={o.type} /> {o.location} · Submitted {o.createdAt}</p>
                  </div>
                  <StatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

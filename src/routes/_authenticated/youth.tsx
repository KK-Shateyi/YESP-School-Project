import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, RequireRole, StatusBadge } from "@/components/ui-bits";
import { actions, LOCATIONS, useCurrentUser, useDB, type Profile } from "@/lib/store";

export const Route = createFileRoute("/_authenticated/youth")({
  head: () => ({
    meta: [
      { title: "My Dashboard – YESP Youth" },
      { name: "description", content: "Manage your YESP profile and track your applications." },
      { property: "og:title", content: "Youth Dashboard – YESP" },
      { property: "og:description", content: "Your profile and applications on YESP." },
    ],
  }),
  component: () => <RequireRole role="youth"><Youth /></RequireRole>,
});

function Youth() {
  const user = useCurrentUser()!;
  const db = useDB();
  const existing = db.profiles.find((p) => p.userId === user.id);
  const [p, setP] = useState<Profile>(existing ?? { userId: user.id, fullName: user.name, email: user.email, location: "", education: "", skills: "", interests: "" });
  const [saved, setSaved] = useState(false);
  useEffect(() => { if (existing) setP(existing); }, [existing?.userId]); // eslint-disable-line
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setP({ ...p, [k]: e.target.value }); setSaved(false); };
  const apps = db.apps.filter((a) => a.userId === user.id);
  const complete = [p.location, p.education, p.skills, p.interests].filter(Boolean).length;

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} sub="Manage your profile and applications.">
        <Link to="/opportunities" className="btn btn-gold">Search opportunities</Link>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_1fr]">
        <form className="card space-y-4 p-6" onSubmit={(e) => { e.preventDefault(); actions.saveProfile(p); setSaved(true); }}>
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">My profile</h2><span className="text-xs text-muted-foreground">{complete}/4 sections complete</span></div>
          <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${complete * 25}%` }} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label">Full name</label><input className="field" required value={p.fullName} onChange={set("fullName")} /></div>
            <div><label className="label">Email</label><input className="field" type="email" required value={p.email} onChange={set("email")} /></div>
            <div><label className="label">Location</label><select className="field" value={p.location} onChange={set("location")}><option value="">Select…</option>{LOCATIONS.map((l) => <option key={l}>{l}</option>)}</select></div>
            <div><label className="label">Education</label><input className="field" placeholder="e.g. Matric, Diploma in IT" value={p.education} onChange={set("education")} /></div>
          </div>
          <div><label className="label">Skills</label><input className="field" placeholder="e.g. HTML, Excel, Customer service" value={p.skills} onChange={set("skills")} /></div>
          <div><label className="label">Areas of interest</label><input className="field" placeholder="e.g. Web development, Data" value={p.interests} onChange={set("interests")} /></div>
          <div className="flex items-center gap-3"><button className="btn btn-gold">Save profile</button>{saved && <span className="text-sm font-semibold text-success">✓ Profile saved</span>}</div>
        </form>

        <div className="card p-6">
          <h2 className="text-xl font-bold">My applications</h2>
          {apps.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">You haven't applied yet. <Link to="/opportunities" className="font-semibold text-gold-deep">Browse opportunities →</Link></p>
          ) : (
            <ul className="mt-4 divide-y">
              {apps.map((a) => {
                const o = db.opps.find((x) => x.id === a.oppId);
                return (
                  <li key={a.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      {o ? <Link to="/opportunities/$id" params={{ id: o.id }} className="block truncate font-semibold hover:text-gold-deep">{o.title}</Link> : <span>Removed listing</span>}
                      <p className="text-xs text-muted-foreground">{o?.organisation} · Applied {a.date}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

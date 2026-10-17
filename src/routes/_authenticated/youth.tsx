import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageHeader, RequireRole, StatusBadge } from "@/components/ui-bits";
import { actions, LOCATIONS, useCurrentUser, useDB, type Profile } from "@/lib/store";
import { recommend } from '@/lib/matching';
import { OppCard } from '@/components/ui-bits';
import { Button } from '@/components/ui/button';

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
  const user = useCurrentUser();
  const db = useDB();
  const existing = db.profiles.find((p) => p.userId === user?.id);
  const [p, setP] = useState<Profile>(existing ?? { userId: user?.id ?? '', fullName: user?.name ?? '', email: user?.email ?? '', location: "", education: "", skills: "", interests: "" });
  const [saved, setSaved] = useState(false);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  useEffect(() => { if (existing) setP(existing); }, [existing?.userId]); // eslint-disable-line
  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { setP({ ...p, [k]: e.target.value }); setSaved(false); };
  if(!user)return null;
  const apps = db.apps.filter((a) => a.userId === user.id);
  const recommendations = existing ? recommend(existing,db.opps) : [];
  const complete = [p.location, p.education, p.skills, p.interests].filter(Boolean).length;

  return (
    <>
      <PageHeader title={`Welcome, ${user.name.split(" ")[0]}`} sub="Manage your profile and applications.">
        <div className="flex flex-wrap gap-3"><Button asChild variant="outline"><Link to="/cv">Build My CV</Link></Button><Link to="/opportunities" className="btn btn-gold">Search opportunities</Link></div>
      </PageHeader>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.2fr_1fr]">
        <form className="card space-y-4 p-6" onSubmit={async (e) => { e.preventDefault();setBusy(true);setError('');setSaved(false);try{await actions.saveProfile(p);setSaved(true);}catch(e){setError(e instanceof Error?e.message:'Unable to save profile.');}finally{setBusy(false);} }}>
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
          <div><label className="label" htmlFor="profile-experience">Work experience</label><input id="profile-experience" className="field" value={p.experience??''} onChange={set('experience')} /></div>
          <div className="flex items-center gap-3"><Button disabled={busy}>{busy?'Saving…':'Save profile'}</Button>{saved && <span role="status" className="text-sm font-semibold text-success">✓ Profile saved</span>}</div>{error&&<p role="alert" className="text-sm text-destructive">{error}</p>}
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
      <section className="mx-auto max-w-6xl px-4"><div className="mb-4 flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-bold">Recommended for You</h2><Link to="/opportunities" className="text-gold-deep font-semibold">View all opportunities →</Link></div>
        {!existing?.skills.trim()||!existing.education.trim()?<p className="text-muted-foreground">Add and save your skills and education to see recommendations.</p>:recommendations.length?<><p className="mb-4 text-sm text-muted-foreground">Suggestions based on shared profile terms; check every listed requirement before applying.</p><div className="grid gap-4 sm:grid-cols-3">{recommendations.map(r=><div key={r.opportunity.id}><OppCard o={r.opportunity}/><ul className="mt-2 text-sm text-muted-foreground">{r.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>)}</div></>:<p className="text-muted-foreground">No close matches yet. You can still browse all opportunities.</p>}
      </section>
    </>
  );
}

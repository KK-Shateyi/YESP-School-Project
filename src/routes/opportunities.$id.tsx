import { createFileRoute, Link } from "@tanstack/react-router";
import { StatusBadge, TypeTag } from "@/components/ui-bits";
import { actions, useCurrentUser, useDB } from "@/lib/store";

export const Route = createFileRoute("/opportunities/$id")({
  head: () => ({
    meta: [
      { title: "Opportunity details – YESP" },
      { name: "description", content: "View requirements, closing date and apply for this opportunity on YESP." },
      { property: "og:title", content: "Opportunity details – YESP" },
      { property: "og:description", content: "View and apply for this youth opportunity." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useParams();
  const db = useDB();
  const user = useCurrentUser();
  const o = db.opps.find((x) => x.id === id);
  const canView = o && (o.status === "approved" || user?.role === "admin" || user?.id === o.employerId);
  if (!o || !canView)
    return <div className="p-12 text-center"><h1 className="text-xl font-bold">Opportunity not available</h1><Link to="/opportunities" className="btn btn-gold mt-4">Back to opportunities</Link></div>;
  const applied = user && db.apps.find((a) => a.oppId === o.id && a.userId === user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/opportunities" className="text-sm text-muted-foreground hover:text-foreground">← All opportunities</Link>
      <div className="card mt-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-2"><TypeTag type={o.type} /><span className="text-sm text-muted-foreground">{o.category}</span>{o.status !== "approved" && <StatusBadge status={o.status} />}</div>
        <h1 className="mt-3 text-3xl font-black">{o.title}</h1>
        <p className="text-muted-foreground">{o.organisation}</p>
        <div className="mt-4 grid gap-3 rounded-lg bg-muted p-4 text-sm sm:grid-cols-2">
          <div><span className="font-semibold">Location:</span> {o.location}</div>
          <div><span className="font-semibold">Closing date:</span> {o.closingDate}</div>
        </div>
        <h2 className="mt-6 font-bold">Description</h2>
        <p className="mt-1 whitespace-pre-line text-muted-foreground">{o.description}</p>
        <h2 className="mt-6 font-bold">Requirements</h2>
        <ul className="mt-2 space-y-1">{o.requirements.split("\n").filter(Boolean).map((r) => <li key={r} className="flex gap-2"><span className="text-gold-deep">✓</span>{r}</li>)}</ul>

        <div className="mt-8 border-t pt-6">
          {o.status !== "approved" ? <p className="text-sm text-muted-foreground">Applications open once this opportunity is approved.</p>
          : applied ? (
            <div className="rounded-lg bg-success-soft p-4">
              <p className="font-bold text-success">✓ Application submitted on {applied.date}</p>
              <p className="mt-1 text-sm">Status: <StatusBadge status={applied.status} /></p>
              <Link to="/youth" className="btn btn-ink mt-3">View my applications</Link>
            </div>
          ) : !user ? (
            <div className="flex flex-wrap gap-3"><Link to="/login" className="btn btn-gold">Login to apply</Link><Link to="/register" className="btn btn-outline">Register</Link></div>
          ) : user.role === "youth" ? (
            <button className="btn btn-gold w-full sm:w-auto" onClick={() => actions.apply(o.id, user.id)}>Apply now</button>
          ) : <p className="text-sm text-muted-foreground">Only youth accounts can apply.</p>}
        </div>
      </div>
    </div>
  );
}

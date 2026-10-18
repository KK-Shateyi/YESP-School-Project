import { createFileRoute, Link } from "@tanstack/react-router";
import { OppCard } from "@/components/ui-bits";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "YESP – Youth Employment & Skills Portal" },
      { name: "description", content: "Find jobs, internships, learnerships and skills training for South African youth." },
      { property: "og:title", content: "YESP – Youth Employment & Skills Portal" },
      { property: "og:description", content: "Bridging youth employment through skills development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const features = [
  { icon: "🔍", title: "Find Opportunities", text: "Search approved jobs, internships, learnerships and training near you." },
  { icon: "👤", title: "Build Your Profile", text: "Capture your education, skills and interests so employers can see your potential." },
  { icon: "📚", title: "Develop Your Skills", text: "Join verified training programmes and learnerships to grow your career." },
];

function Index() {
  const db = useDB();
  const latest = db.opps.filter((o) => o.status === "approved").slice(0, 3);
  return (
    <>
      <section className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="mb-4 inline-block rounded-full bg-gold-soft px-3 py-1 text-xs font-semibold text-gold-deep">Youth Employment & Skills Portal</p>
          <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            Bridging youth employment through <span className="underline decoration-primary decoration-[6px] underline-offset-4">skills development.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            YESP connects South African youth with verified employers and training providers. Every opportunity is reviewed by an administrator before it is published.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/opportunities" className="btn btn-gold">Find Opportunities</Link>
            <Link to="/register" className="btn btn-ink">Register</Link>
            <Link to="/login" className="btn btn-outline">Login</Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-5 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg bg-gold-soft text-xl">{f.icon}</div>
              <h3 className="text-lg font-bold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4">
        <div className="mb-5 flex items-end justify-between">
          <h2 className="text-2xl font-extrabold">Latest opportunities</h2>
          <Link to="/opportunities" className="text-sm font-semibold text-gold-deep hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">{latest.map((o) => <OppCard key={o.id} o={o} />)}</div>
      </section>
    </>
  );
}

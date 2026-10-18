import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { OppCard, PageHeader } from "@/components/ui-bits";
import { CATEGORIES, OPP_TYPES, useDB } from "@/lib/store";

export const Route = createFileRoute("/opportunities/")({
  head: () => ({
    meta: [
      { title: "Opportunities – YESP" },
      { name: "description", content: "Search approved jobs, internships, learnerships and training across South Africa." },
      { property: "og:title", content: "Opportunities – YESP" },
      { property: "og:description", content: "Search and filter youth opportunities in South Africa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Opportunities,
});

function Opportunities() {
  const db = useDB();
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [loc, setLoc] = useState("");
  const [cat, setCat] = useState("");
  const approved = db.opps.filter((o) => o.status === "approved");
  const locations = [...new Set(approved.map((o) => o.location))].sort();
  const list = approved.filter((o) =>
    (!q || `${o.title} ${o.organisation} ${o.description}`.toLowerCase().includes(q.toLowerCase())) &&
    (!type || o.type === type) && (!loc || o.location === loc) && (!cat || o.category === cat));
  const cats = [...new Set([...CATEGORIES, ...approved.map((o) => o.category)])];

  return (
    <>
      <PageHeader title="Opportunities" sub={`${approved.length} approved opportunities`} />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="card mb-6 grid gap-3 p-4 sm:grid-cols-4">
          <input className="field sm:col-span-4" placeholder="Search e.g. web developer, data, learnership…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="field" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{OPP_TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select className="field" value={loc} onChange={(e) => setLoc(e.target.value)}><option value="">All locations</option>{locations.map((l) => <option key={l}>{l}</option>)}</select>
          <select className="field" value={cat} onChange={(e) => setCat(e.target.value)}><option value="">All categories</option>{cats.map((c) => <option key={c}>{c}</option>)}</select>
          <button className="btn btn-outline" onClick={() => { setQ(""); setType(""); setLoc(""); setCat(""); }}>Clear filters</button>
        </div>
        {list.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((o) => <OppCard key={o.id} o={o} />)}</div>
        ) : <p className="py-12 text-center text-muted-foreground">No opportunities match your search.</p>}
      </div>
    </>
  );
}

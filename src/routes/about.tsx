import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About YESP – Youth Employment & Skills Portal" },
      { name: "description", content: "How YESP connects South African youth, employers, training providers and administrators." },
      { property: "og:title", content: "About YESP" },
      { property: "og:description", content: "How YESP connects youth with verified opportunities." },
    ],
  }),
  component: About,
});

function About() {
  const steps = [
    ["Employers & training providers", "Create opportunities and submit them for approval."],
    ["Administrator", "Reviews every submission and approves or rejects it."],
    ["Youth", "Search approved opportunities, view details and apply."],
  ];
  return (
    <>
      <PageHeader title="About YESP" sub="Bridging youth employment through skills development." />
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-10">
        <p className="text-lg">YESP is an academic functional prototype that helps South African youth find employment, internships, learnerships and skills-development opportunities in one trusted place.</p>
        <div className="grid gap-4">
          {steps.map(([t, d], i) => (
            <div key={t} className="card flex gap-4 p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{i + 1}</span>
              <div><h3 className="font-bold">{t}</h3><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">Designed to be lightweight for entry-level smartphones and low-data connections. All listings and organisations shown are demonstration data.</p>
      </div>
    </>
  );
}

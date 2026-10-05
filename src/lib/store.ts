import { useSyncExternalStore } from "react";

export type Role = "youth" | "employer" | "admin";
export type OppType = "Job" | "Internship" | "Learnership" | "Training";
export type OppStatus = "pending" | "approved" | "rejected";

export interface User { id: string; name: string; email: string; password: string; role: Role; organisation?: string }
export interface Profile { userId: string; fullName: string; email: string; location: string; education: string; skills: string; interests: string }
export interface Opportunity {
  id: string; title: string; organisation: string; type: OppType; location: string; category: string;
  description: string; requirements: string; closingDate: string; status: OppStatus; employerId: string; createdAt: string;
}
export interface Application { id: string; oppId: string; userId: string; date: string; status: "Submitted" | "Under Review" }
export interface DB { users: User[]; profiles: Profile[]; opps: Opportunity[]; apps: Application[]; sessionId: string | null }

export const OPP_TYPES: OppType[] = ["Job", "Internship", "Learnership", "Training"];
export const CATEGORIES = ["ICT", "Data & Analytics", "Digital Skills", "Business & Admin", "Engineering", "Hospitality"];
export const LOCATIONS = ["Johannesburg", "Gauteng", "Soweto", "Pretoria", "Cape Town", "Durban", "Polokwane", "Remote"];

const today = () => new Date().toISOString().slice(0, 10);
const uid = () => Math.random().toString(36).slice(2, 10);

function seed(): DB {
  return {
    sessionId: null,
    users: [
      { id: "admin1", name: "YESP Administrator", email: "admin@yesp.co.za", password: "admin123", role: "admin" },
      { id: "emp1", name: "Lerato Mokoena", email: "employer@techhub.co.za", password: "employer123", role: "employer", organisation: "TechHub Joburg (Demo)" },
      { id: "emp2", name: "Sipho Dlamini", email: "skills@ubuntuacademy.co.za", password: "employer123", role: "employer", organisation: "Ubuntu Skills Academy (Demo)" },
      { id: "youth1", name: "Thabo Nkosi", email: "thabo@demo.co.za", password: "youth123", role: "youth" },
    ],
    profiles: [
      { userId: "youth1", fullName: "Thabo Nkosi", email: "thabo@demo.co.za", location: "Soweto", education: "Matric + N4 IT", skills: "HTML, CSS, Excel", interests: "Web development, IT support" },
    ],
    opps: [
      { id: "o1", title: "IT Support Learnership", organisation: "Ubuntu Skills Academy (Demo)", type: "Learnership", location: "Gauteng", category: "ICT",
        description: "A 12-month NQF Level 4 learnership combining classroom training with workplace experience in desktop and network support.",
        requirements: "Matric certificate\nAged 18–35\nUnemployed South African citizen\nBasic computer literacy", closingDate: "2026-11-30", status: "approved", employerId: "emp2", createdAt: "2026-09-01" },
      { id: "o2", title: "Digital Skills Training Programme", organisation: "Ubuntu Skills Academy (Demo)", type: "Training", location: "Soweto", category: "Digital Skills",
        description: "Free 8-week programme covering digital literacy, email, Microsoft Office, online safety and CV writing. Stipend for transport provided.",
        requirements: "Grade 11 or Matric\nLiving in or near Soweto\nCommitment to attend 3 days per week", closingDate: "2026-11-15", status: "approved", employerId: "emp2", createdAt: "2026-09-10" },
      { id: "o3", title: "Data Analytics Internship", organisation: "TechHub Joburg (Demo)", type: "Internship", location: "Johannesburg", category: "Data & Analytics",
        description: "6-month paid internship working with our analytics team on dashboards, reporting and data cleaning using Excel, SQL and Power BI.",
        requirements: "Diploma or degree in Statistics, IT or related\nStrong Excel skills\nAnalytical mindset", closingDate: "2026-12-05", status: "approved", employerId: "emp1", createdAt: "2026-09-15" },
      { id: "o4", title: "Junior Admin Clerk", organisation: "Mzansi Logistics (Demo)", type: "Job", location: "Pretoria", category: "Business & Admin",
        description: "Entry-level permanent role supporting the operations office with filing, data capture and customer queries.",
        requirements: "Matric\nComputer literate\nGood communication in English", closingDate: "2026-11-20", status: "approved", employerId: "emp1", createdAt: "2026-09-20" },
      { id: "o5", title: "Hospitality Learnership", organisation: "Coastal Hotels Group (Demo)", type: "Learnership", location: "Durban", category: "Hospitality",
        description: "Front-of-house and food service learnership in partnership with a leading hotel group.",
        requirements: "Matric\nAged 18–30\nFriendly and customer-focused", closingDate: "2026-12-10", status: "pending", employerId: "emp2", createdAt: "2026-10-01" },
    ],
    apps: [],
  };
}

const KEY = "yesp-demo-db-v1";
let state: DB = seed();
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { const raw = localStorage.getItem(KEY); if (raw) state = JSON.parse(raw); } catch { /* ignore */ }
}
function emit() {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
export function update(fn: (db: DB) => DB) { load(); state = fn(state); emit(); }

const serverSnap = seed();
export function useDB(): DB {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => { load(); return state; },
    () => serverSnap,
  );
}
export function useCurrentUser(): User | null {
  const db = useDB();
  return db.users.find((u) => u.id === db.sessionId) ?? null;
}

export const actions = {
  login(email: string, password: string): User | string {
    load();
    const u = state.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (!u) return "Incorrect email or password.";
    update((d) => ({ ...d, sessionId: u.id }));
    return u;
  },
  register(data: { name: string; email: string; password: string; role: Role; organisation?: string }): User | string {
    load();
    if (state.users.some((x) => x.email.toLowerCase() === data.email.trim().toLowerCase())) return "An account with this email already exists.";
    const u: User = { id: uid(), ...data, email: data.email.trim() };
    update((d) => ({
      ...d, users: [...d.users, u], sessionId: u.id,
      profiles: u.role === "youth" ? [...d.profiles, { userId: u.id, fullName: u.name, email: u.email, location: "", education: "", skills: "", interests: "" }] : d.profiles,
    }));
    return u;
  },
  logout() { update((d) => ({ ...d, sessionId: null })); },
  saveProfile(p: Profile) { update((d) => ({ ...d, profiles: [...d.profiles.filter((x) => x.userId !== p.userId), p] })); },
  createOpp(o: Omit<Opportunity, "id" | "status" | "createdAt">) {
    update((d) => ({ ...d, opps: [{ ...o, id: uid(), status: "pending", createdAt: today() }, ...d.opps] }));
  },
  setStatus(id: string, status: OppStatus) { update((d) => ({ ...d, opps: d.opps.map((o) => (o.id === id ? { ...o, status } : o)) })); },
  apply(oppId: string, userId: string) {
    update((d) => d.apps.some((a) => a.oppId === oppId && a.userId === userId) ? d
      : ({ ...d, apps: [{ id: uid(), oppId, userId, date: today(), status: "Submitted" }, ...d.apps] }));
  },
  reset() { const s = seed(); update(() => s); },
};

export function dashboardPath(role: Role) { return role === "youth" ? "/youth" : role === "employer" ? "/employer" : "/admin"; }

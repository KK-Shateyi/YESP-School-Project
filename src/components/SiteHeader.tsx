import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { actions, dashboardPath, useCurrentUser } from "@/lib/store";

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">Y</span>
      <span className="text-xl font-black tracking-tight">YESP</span>
    </Link>
  );
}

export function SiteHeader() {
  const user = useCurrentUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const link = "text-sm font-medium text-ink-foreground/80 hover:text-primary";
  const active = { className: "text-primary" };
  const logout = async () => { await queryClient.cancelQueries(); queryClient.clear(); await actions.logout(); setOpen(false); await navigate({ to: "/auth", replace: true }); };

  const nav = (
    <>
      <Link to="/" className={link} activeProps={active} activeOptions={{ exact: true }} onClick={() => setOpen(false)}>Home</Link>
      <Link to="/opportunities" className={link} activeProps={active} onClick={() => setOpen(false)}>Opportunities</Link>
      <Link to="/about" className={link} activeProps={active} onClick={() => setOpen(false)}>About</Link>
      {user ? (
        <>
          <Link to={dashboardPath(user.role)} className={link} activeProps={active} onClick={() => setOpen(false)}>Dashboard</Link>
          <span className="text-xs text-ink-foreground/80">{user.name} · {user.role}</span>
          <Button onClick={logout}>Logout</Button>
        </>
      ) : (
        <>
          <Link to="/login" className={link} activeProps={active} onClick={() => setOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-gold !py-1.5" onClick={() => setOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 bg-ink text-ink-foreground">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="[&_span:last-child]:text-ink-foreground"><Logo /></div>
        <nav className="hidden items-center gap-6 md:flex">{nav}</nav>
        <button className="md:hidden rounded-md border border-ink-foreground/30 px-3 py-1.5 text-sm" onClick={() => setOpen(!open)} aria-label="Menu">{open ? "Close" : "Menu"}</button>
      </div>
      {open && <nav className="flex flex-col items-start gap-4 border-t border-ink-foreground/15 px-4 py-4 md:hidden">{nav}</nav>}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-ink-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:grid-cols-3">
        <div>
          <p className="text-lg font-black">YESP</p>
          <p className="mt-1 text-sm text-ink-foreground/80">Bridging youth employment through skills development.</p>
        </div>
        <div className="flex flex-col gap-1 text-sm text-ink-foreground/80">
          <Link to="/opportunities" className="hover:text-primary">Opportunities</Link>
          <Link to="/about" className="hover:text-primary">About</Link>
          <Link to="/register" className="hover:text-primary">Register</Link>
        </div>
        <div className="text-sm text-ink-foreground/80">
          <p>{"\n"}</p>
          <p className="mt-1">All organisations and listings are demonstration data.</p>
        </div>
      </div>
      <p className="border-t border-ink-foreground/10 py-4 text-center text-xs text-ink-foreground/70">© 2026 ILS2B YESP – Youth Employment & Skills Portal</p>
    </footer>
  );
}

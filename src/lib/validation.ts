export function profileError(p: { fullName: string; email: string }) {
  if (!p.fullName.trim()) return 'Enter your full name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) return 'Enter a valid email address.';
  return '';
}
export function registrationError(p: { name: string; email: string; password: string; organisation?: string | undefined }, role: string) {
  const error = profileError({ fullName: p.name, email: p.email });
  if (error) return error;
  if (p.password.length < 6) return 'Password must be at least 6 characters.';
  if (role === 'employer' && !p.organisation?.trim()) return 'Enter your organisation name.';
  return '';
}
export function rejectionError(reason: string) {
  return reason.trim().length < 5 ? 'Enter a rejection reason of at least 5 characters.' : '';
}
export function matchesSearch(text: string, query: string) {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean).every(term => text.toLowerCase().includes(term));
}
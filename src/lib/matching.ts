import type { Opportunity, Profile } from './store';

export function terms(text: string): string[] {
  return [...new Set(text.toLowerCase().match(/[a-z0-9+#]+/g) ?? [])].filter(t => t.length > 1 && !['and','the','or','in','of','with','for','basic','related','strong','skills','degree'].includes(t));
}
export function recommend(profile: Profile, opportunities: Opportunity[]) {
  if (!profile.skills.trim() || !profile.education.trim()) return [];
  return opportunities.filter(o => o.status === 'approved').map(o => {
    const skillSource = terms(`${o.skills ?? ''} ${o.requirements} ${o.description}`);
    const qualificationSource = terms(o.qualifications || o.requirements);
    const skills = terms(profile.skills).filter(t => skillSource.includes(t));
    const qualifications = terms(profile.education).filter(t => qualificationSource.includes(t) && ['matric','diploma','certificate','n4','n5','n6','bachelor','grade','11','12'].includes(t));
    const interests = terms(`${profile.interests} ${profile.experience ?? ''}`).filter(t => terms(`${o.title} ${o.category} ${o.description}`).includes(t));
    const reasons = [skills.length ? `Matches your skills: ${skills.join(', ')}` : '', qualifications.length ? `Shared qualification terms: ${qualifications.join(', ')}` : '', interests.length ? `Related to your interests or experience: ${interests.slice(0,3).join(', ')}` : ''].filter(Boolean);
    return { opportunity: o, score: skills.length * 3 + qualifications.length * 2 + interests.length, reasons };
  }).filter(r => r.score > 0).sort((a,b) => b.score-a.score).slice(0,3);
}
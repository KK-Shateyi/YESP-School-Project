import type { Profile } from './store';
export const CV_FIELDS = ['fullName','email','phone','location','summary','education','qualifications','skills','experience','projects','achievements','certifications'] as const;
export type CV = Record<(typeof CV_FIELDS)[number], string>;
export function initialCV(profile: Profile): CV {
  return { fullName: profile.fullName, email: profile.email, phone: '', location: profile.location, summary: '', education: profile.education, qualifications: '', skills: profile.skills, experience: profile.experience ?? '', projects: '', achievements: '', certifications: '' };
}
export function readCV(value: unknown, fallback: CV): CV {
  if (!value || typeof value !== 'object') return fallback;
  const result = { ...fallback };
  for (const key of CV_FIELDS) {
    const text = (value as Record<string, unknown>)[key];
    if (typeof text === 'string') result[key] = text;
  }
  return result;
}
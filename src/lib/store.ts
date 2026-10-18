import { useSyncExternalStore } from 'react';
import { queryOptions } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getPublicOpportunities } from './opportunities.functions';
import type { Database } from '@/integrations/supabase/types';
import { profileError, registrationError, rejectionError } from './validation';
export type Role = 'youth' | 'employer' | 'admin';
export type OppType = 'Job' | 'Internship' | 'Learnership' | 'Training';
export type OppStatus = 'pending' | 'approved' | 'rejected';
export interface User { id: string; name: string; email: string; role: Role; organisation?: string | undefined }
export interface Profile { userId: string; fullName: string; email: string; location: string; education: string; skills: string; interests: string; experience?: string | undefined }
export interface Opportunity { id: string; title: string; organisation: string; type: OppType; location: string; category: string; description: string; requirements: string; closingDate: string; status: OppStatus; employerId: string; createdAt: string; skills?: string | undefined; qualifications?: string | undefined; instructions?: string | undefined; rejectionReason?: string | undefined }
export interface Application { id: string; oppId: string; userId: string; date: string; status: 'Submitted' | 'Under Review' }
export interface DB { users: User[]; profiles: Profile[]; opps: Opportunity[]; apps: Application[]; sessionId: string | null; loading: boolean; error: string }
export const OPP_TYPES: OppType[] = ['Job','Internship','Learnership','Training'];
export const CATEGORIES = ['ICT','Data & Analytics','Digital Skills','Business & Admin','Engineering','Hospitality'];
export const LOCATIONS = ['Johannesburg','Gauteng','Soweto','Pretoria','Cape Town','Durban','Polokwane','Remote'];
type OppRow = Database['public']['Tables']['opportunities']['Row'];
export function mapOpportunity(o: OppRow): Opportunity { return { ...o, type: o.type as OppType, status: o.status as OppStatus, closingDate: o.closing_date, employerId: o.employer_id ?? '', createdAt: o.created_at.slice(0,10), rejectionReason: o.rejection_reason }; }
export const publicOpportunitiesOptions = queryOptions({ queryKey: ['public-opportunities'], queryFn: async () => (await getPublicOpportunities()).map(mapOpportunity) });
const empty: DB = {users:[],profiles:[],opps:[],apps:[],sessionId:null,loading:true,error:''};
let state: DB = empty;
let revision = 0;
const listeners = new Set<() => void>();
function emit(next: Partial<DB>) { state = {...state,...next}; listeners.forEach(l=>l()); }
export function useDB() { return useSyncExternalStore(l=>{listeners.add(l);return ()=>listeners.delete(l);},()=>state,()=>empty); }
export function useCurrentUser() { const db=useDB();return db.users.find(u=>u.id===db.sessionId) ?? null; }
let refreshQueue: Promise<void> = Promise.resolve();
export function refreshData() {
  refreshQueue = refreshQueue.then(loadAccountData, loadAccountData);
  return refreshQueue;
}
async function loadAccountData() {
  const current = ++revision;
  try {
    const {data:{user},error:authError}=await supabase.auth.getUser();
    if(authError && user) throw authError;
    if (!user) {
      const {data,error}=await supabase.from('opportunities').select('*').eq('status','approved').order('created_at',{ascending:false});
      if(error) throw error;
      if(current===revision) emit({users:[],profiles:[],apps:[],sessionId:null,opps:(data??[]).map(mapOpportunity),loading:false,error:''});
      return;
    }
    const [p,r,o,a]=await Promise.all([supabase.from('profiles').select('*').eq('id',user.id).single(),supabase.from('user_roles').select('role').eq('user_id',user.id).single(),supabase.from('opportunities').select('*').order('created_at',{ascending:false}),supabase.from('applications').select('*')]);
    if(p.error||r.error||o.error||a.error) throw p.error||r.error||o.error||a.error;
    if(current!==revision) return;
    const profile=p.data;
    emit({users:[{id:user.id,name:profile.full_name,email:user.email??'',role:r.data.role,organisation:profile.organisation}],profiles:[{userId:user.id,fullName:profile.full_name,email:profile.email,location:profile.location,education:profile.education,skills:profile.skills,interests:profile.interests,experience:profile.experience}],sessionId:user.id,opps:(o.data??[]).map(mapOpportunity),apps:(a.data??[]).map(x=>({id:x.id,oppId:x.opp_id,userId:x.user_id,date:x.date,status:x.status as Application['status']})),loading:false,error:''});
   } catch { if(current===revision) emit({users:[],profiles:[],apps:[],sessionId:null,loading:false,error:'Unable to load your account data. Please try again.'}); }
}
export function clearAccount() { revision++;emit({...empty,opps:state.opps.filter(o=>o.status==='approved'),loading:false}); }
export const actions = {
 async login(email:string,password:string):Promise<User|string> { const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error)return 'Unable to sign in. Check your email and password, and confirm your email if needed.';await refreshData();return state.users[0]??'Your account could not be loaded. Please try again.'; },
  async register(data:{name:string;email:string;password:string;role:Role;organisation?:string|undefined}):Promise<string|null> { const invalid=registrationError(data,data.role);if(invalid)return invalid;const {error}=await supabase.auth.signUp({email:data.email.trim(),password:data.password,options:{emailRedirectTo:window.location.origin,data:{name:data.name.trim(),role:data.role==='employer'?'employer':'youth',organisation:data.organisation?.trim()??''}}});return error?'Registration could not be completed. Check your details or try signing in.':null; },
 async logout(){clearAccount();await supabase.auth.signOut();},
  async saveProfile(p:Profile){const invalid=profileError(p);if(invalid)throw new Error(invalid);const{error}=await supabase.from('profiles').update({full_name:p.fullName.trim(),email:p.email.trim(),location:p.location,education:p.education.trim(),skills:p.skills.trim(),interests:p.interests.trim(),experience:p.experience??''}).eq('id',p.userId);if(error)throw new Error('Profile could not be saved. Please try again.');await refreshData();if(state.error)throw new Error(state.error);},
 async createOpp(o:Omit<Opportunity,'id'|'status'|'createdAt'>){const{error}=await supabase.from('opportunities').insert({title:o.title.trim(),organisation:o.organisation.trim(),type:o.type,location:o.location,category:o.category,description:o.description.trim(),requirements:o.requirements.trim(),closing_date:o.closingDate,employer_id:o.employerId,skills:o.skills??'',qualifications:o.qualifications??'',instructions:o.instructions??''});if(error)throw new Error(error.code==='23505'?'This opportunity has already been submitted.':'Unable to submit this opportunity. Please check your details.');await refreshData();},
  async setStatus(id:string,status:OppStatus,reason=''){if(status==='rejected'){const invalid=rejectionError(reason);if(invalid)throw new Error(invalid);}const{error}=await supabase.rpc('review_opportunity',{_id:id,_status:status,_reason:reason});if(error)throw new Error(error.message);await refreshData();},
 async apply(oppId:string,userId:string){const{error}=await supabase.from('applications').insert({opp_id:oppId,user_id:userId});if(error&&error.code!=='23505')throw new Error('Application could not be submitted. The listing may have closed. Please try again.');await refreshData();},
 reset(){ /* Legacy browser data deliberately retained; never delete Cloud records. */ },
};
export function dashboardPath(role:Role){return role==='youth'?'/youth':role==='employer'?'/employer':'/admin';}

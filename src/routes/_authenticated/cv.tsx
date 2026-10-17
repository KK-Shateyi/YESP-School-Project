import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCurrentUser, useDB } from '@/lib/store';
import { CV_FIELDS, initialCV, readCV } from '@/lib/cv';
import { profileError } from '@/lib/validation';
import { RequireRole, PageHeader } from '@/components/ui-bits';
import { Button } from '@/components/ui/button';
import { Save, Printer } from 'lucide-react';
import { pageHead } from '@/lib/meta';
export const Route = createFileRoute('/_authenticated/cv')({ head: () => pageHead('My CV – YESP', 'Build, save and print your private entry-level CV.'), component: () => <RequireRole role="youth"><CVBuilder /></RequireRole> });
const labels: Record<string,string> = { fullName:'Full name',email:'Email',phone:'Phone',location:'Location',summary:'Personal summary',education:'Education',qualifications:'Qualifications',skills:'Skills',experience:'Work experience',projects:'Projects',achievements:'Achievements',certifications:'Certifications' };
function CVBuilder() {
  const user = useCurrentUser();const db = useDB();
  const profile = db.profiles.find(p=>p.userId===user?.id);
  const query = useQuery({ queryKey:['my-cv',user?.id], enabled:Boolean(user && profile), queryFn: async()=> {
    if(!user || !profile)throw new Error('Account unavailable.');
    const {data,error}=await supabase.from('cvs').select('data').eq('user_id',user.id).maybeSingle();if(error)throw new Error('CV could not be loaded. Try again.');
    return readCV(data?.data,initialCV(profile));
  }});
  const [draft,setDraft]=useState<ReturnType<typeof initialCV> | null>(null);
  const [message,setMessage]=useState('');const [busy,setBusy]=useState(false);
  if(!user || !profile || query.isPending)return <p className="p-12" role="status">Loading your CV…</p>;
  if(query.error || !query.data)return <div className="p-12"><p role="alert">{query.error?.message}</p><Button onClick={()=>query.refetch()}>Try again</Button></div>;
  const cv=draft??query.data;
  const incomplete=!cv.fullName.trim()||!cv.email.trim()||!cv.education.trim()||!cv.skills.trim();
  return <><div className="print-hidden"><PageHeader title="Build My CV" sub={user.name}><Button asChild variant="outline"><Link to="/youth">Back to my profile</Link></Button></PageHeader></div>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-2">
      <form className="print-hidden space-y-4" onSubmit={async e=>{e.preventDefault();const invalid=profileError(cv);if(invalid)return setMessage(invalid);setBusy(true);setMessage('');try{const{error}=await supabase.from('cvs').upsert({user_id:user.id,data:cv,updated_at:new Date().toISOString()});if(error)throw error;setMessage('CV saved.');}catch{setMessage('CV could not be saved. Please try again.');}finally{setBusy(false);}}}>
        <h2 className="text-xl font-bold">CV details</h2><p className="text-sm text-muted-foreground">* Required: full name, email, education and skills.</p>
        {CV_FIELDS.map(key=><div key={key}><label className="label" htmlFor={`cv-${key}`}>{labels[key]}{['fullName','email','education','skills'].includes(key)?' *':''}</label>{['fullName','email','phone','location'].includes(key)?<input className="field" id={`cv-${key}`} type={key==='email'?'email':key==='phone'?'tel':'text'} required={key==='fullName'||key==='email'} value={cv[key]} onChange={e=>{setDraft({...cv,[key]:e.target.value});setMessage('');}}/>:<textarea className="field min-h-24" id={`cv-${key}`} required={key==='education'||key==='skills'} value={cv[key]} onChange={e=>{setDraft({...cv,[key]:e.target.value});setMessage('');}}/>}</div>)}
        <div className="flex flex-wrap gap-3"><Button disabled={busy}><Save/>{busy?'Saving…':'Save CV'}</Button><Button type="button" variant="outline" disabled={incomplete} onClick={()=>window.print()}><Printer/>Print / Save PDF</Button></div>{message&&<p role="status">{message}</p>}
      </form>
      <section><h2 className="print-hidden mb-4 text-xl font-bold">CV preview</h2>{incomplete&&<p className="print-hidden mb-4 text-sm text-muted-foreground">Your CV is incomplete. Add the required details before printing.</p>}
        <article className="cv-print border bg-background p-6 sm:p-10 break-words"><h1 className="text-3xl font-bold">{cv.fullName||'Your name'}</h1><p className="mt-3 text-sm">{[cv.email,cv.phone,cv.location].filter(Boolean).join(' · ')}</p>
          {CV_FIELDS.filter(k=>!['fullName','email','phone','location'].includes(k)&&cv[k].trim()).map(key=><section key={key} className="mt-6 border-t pt-4"><h2 className="font-bold">{labels[key]}</h2><p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{cv[key]}</p></section>)}
        </article>
      </section>
    </div></>;
}
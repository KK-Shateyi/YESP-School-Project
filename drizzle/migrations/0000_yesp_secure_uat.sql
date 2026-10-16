CREATE TYPE public.app_role AS ENUM ('youth','employer','admin');
CREATE TABLE public.profiles (id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, full_name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', organisation text NOT NULL DEFAULT '', location text NOT NULL DEFAULT '', education text NOT NULL DEFAULT '', skills text NOT NULL DEFAULT '', interests text NOT NULL DEFAULT '', experience text NOT NULL DEFAULT '');
GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated; GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profile_read ON public.profiles FOR SELECT TO authenticated USING (id=auth.uid());
CREATE POLICY own_profile_update ON public.profiles FOR UPDATE TO authenticated USING (id=auth.uid()) WITH CHECK (id=auth.uid());
CREATE TABLE public.user_roles (user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, role public.app_role NOT NULL DEFAULT 'youth');
GRANT SELECT ON public.user_roles TO authenticated; GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_role_read ON public.user_roles FOR SELECT TO authenticated USING (user_id=auth.uid());
CREATE FUNCTION public.has_role(_user_id uuid,_role public.app_role) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;
REVOKE ALL ON FUNCTION public.has_role(uuid,public.app_role) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.has_role(uuid,public.app_role) TO authenticated,service_role;
CREATE FUNCTION public.handle_yesp_signup() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 INSERT INTO public.profiles(id,full_name,email,organisation) VALUES (new.id,coalesce(new.raw_user_meta_data->>'name',''),coalesce(new.email,''),coalesce(new.raw_user_meta_data->>'organisation',''));
 INSERT INTO public.user_roles(user_id,role) VALUES(new.id,CASE WHEN new.raw_user_meta_data->>'role'='employer' THEN 'employer'::public.app_role ELSE 'youth'::public.app_role END);
 RETURN new; END $$;
CREATE TRIGGER yesp_signup AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_yesp_signup();
CREATE TABLE public.opportunities (id text PRIMARY KEY DEFAULT gen_random_uuid()::text, title text NOT NULL, organisation text NOT NULL, type text NOT NULL CHECK(type IN ('Job','Internship','Learnership','Training')), location text NOT NULL, category text NOT NULL, description text NOT NULL, requirements text NOT NULL, skills text NOT NULL DEFAULT '', qualifications text NOT NULL DEFAULT '', instructions text NOT NULL DEFAULT '', closing_date date NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')), employer_id uuid, created_at timestamptz NOT NULL DEFAULT now(), rejection_reason text NOT NULL DEFAULT '', reviewed_at timestamptz);
GRANT SELECT ON public.opportunities TO anon; GRANT SELECT,INSERT ON public.opportunities TO authenticated; GRANT ALL ON public.opportunities TO service_role;
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY published_read ON public.opportunities FOR SELECT TO anon,authenticated USING(status='approved');
CREATE POLICY owner_read ON public.opportunities FOR SELECT TO authenticated USING(employer_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY employer_submit ON public.opportunities FOR INSERT TO authenticated WITH CHECK(employer_id=auth.uid() AND public.has_role(auth.uid(),'employer') AND status='pending' AND rejection_reason='' AND reviewed_at IS NULL);
CREATE UNIQUE INDEX prevent_duplicate_listing ON public.opportunities(employer_id,lower(title),lower(organisation),closing_date);
CREATE FUNCTION public.review_opportunity(_id text,_status text,_reason text DEFAULT '') RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Administrator access required'; END IF;
 IF _status NOT IN ('approved','rejected') THEN RAISE EXCEPTION 'Invalid decision'; END IF;
 IF _status='rejected' AND length(trim(_reason))<5 THEN RAISE EXCEPTION 'Please enter a rejection reason (at least 5 characters)'; END IF;
 UPDATE public.opportunities SET status=_status,rejection_reason=CASE WHEN _status='rejected' THEN trim(_reason) ELSE '' END,reviewed_at=now() WHERE id=_id AND status='pending';
 IF NOT FOUND THEN RAISE EXCEPTION 'This listing has already been reviewed'; END IF;
 END $$;
REVOKE ALL ON FUNCTION public.review_opportunity(text,text,text) FROM PUBLIC; GRANT EXECUTE ON FUNCTION public.review_opportunity(text,text,text) TO authenticated;
CREATE TABLE public.applications (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), opp_id text NOT NULL REFERENCES public.opportunities(id), user_id uuid NOT NULL, date date NOT NULL DEFAULT current_date,status text NOT NULL DEFAULT 'Submitted' CHECK(status IN ('Submitted','Under Review')),UNIQUE(opp_id,user_id));
GRANT SELECT,INSERT ON public.applications TO authenticated; GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_applications ON public.applications FOR SELECT TO authenticated USING(user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY youth_apply ON public.applications FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND public.has_role(auth.uid(),'youth') AND status='Submitted' AND EXISTS(SELECT 1 FROM public.opportunities WHERE id=opp_id AND status='approved' AND closing_date>=current_date));
CREATE TABLE public.cvs (user_id uuid PRIMARY KEY, data jsonb NOT NULL DEFAULT '{}'::jsonb,updated_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT,INSERT,UPDATE ON public.cvs TO authenticated; GRANT ALL ON public.cvs TO service_role;
ALTER TABLE public.cvs ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_cv_read ON public.cvs FOR SELECT TO authenticated USING(user_id=auth.uid() AND public.has_role(auth.uid(),'youth'));
CREATE POLICY own_cv_insert ON public.cvs FOR INSERT TO authenticated WITH CHECK(user_id=auth.uid() AND public.has_role(auth.uid(),'youth'));
CREATE POLICY own_cv_update ON public.cvs FOR UPDATE TO authenticated USING(user_id=auth.uid() AND public.has_role(auth.uid(),'youth')) WITH CHECK(user_id=auth.uid() AND public.has_role(auth.uid(),'youth'));
INSERT INTO public.opportunities(id,title,organisation,type,location,category,description,requirements,skills,qualifications,closing_date,status,created_at) VALUES
('o1','IT Support Learnership','Ubuntu Skills Academy (Demo)','Learnership','Gauteng','ICT','A 12-month NQF Level 4 learnership combining classroom training with workplace experience in desktop and network support.','Matric certificate\nAged 18–35\nUnemployed South African citizen\nBasic computer literacy','Computer literacy, IT support','Matric','2026-11-30','approved','2026-09-01'),
('o2','Digital Skills Training Programme','Ubuntu Skills Academy (Demo)','Training','Soweto','Digital Skills','Free 8-week programme covering digital literacy, email, Microsoft Office, online safety and CV writing. Stipend for transport provided.','Grade 11 or Matric\nLiving in or near Soweto\nCommitment to attend 3 days per week','Microsoft Office, email, digital literacy','Grade 11 or Matric','2026-11-15','approved','2026-09-10'),
('o3','Data Analytics Internship','TechHub Joburg (Demo)','Internship','Johannesburg','Data & Analytics','6-month paid internship working with our analytics team on dashboards, reporting and data cleaning using Excel, SQL and Power BI.','Diploma or degree in Statistics, IT or related\nStrong Excel skills\nAnalytical mindset','Excel, SQL, Power BI','Diploma or degree in Statistics, IT or related','2026-12-05','approved','2026-09-15'),
('o4','Junior Admin Clerk','Mzansi Logistics (Demo)','Job','Pretoria','Business & Admin','Entry-level permanent role supporting the operations office with filing, data capture and customer queries.','Matric\nComputer literate\nGood communication in English','Computer literacy, communication','Matric','2026-11-20','approved','2026-09-20'),
('o5','Hospitality Learnership','Coastal Hotels Group (Demo)','Learnership','Durban','Hospitality','Front-of-house and food service learnership in partnership with a leading hotel group.','Matric\nAged 18–30\nFriendly and customer-focused','Customer service','Matric','2026-12-10','pending','2026-10-01');
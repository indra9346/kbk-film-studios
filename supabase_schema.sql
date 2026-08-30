-- ========================================================================
-- KBK FILM STUDIOS - COMPLETE SUPABASE DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor (project: hhqadycmsxsedlvdfcnn)
-- ========================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. OWNERS TABLE
CREATE TABLE IF NOT EXISTS public.owners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'co_owner',
    permissions JSONB NOT NULL DEFAULT '["manage_bookings", "manage_lifecycle", "manage_deliveries", "manage_works"]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. STUDIO CMS TABLE
CREATE TABLE IF NOT EXISTS public.studio_cms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    studio_name TEXT NOT NULL DEFAULT 'KBK Film Studios',
    tagline TEXT NOT NULL DEFAULT 'Luxury Wedding Video Editing & Master Film Post-Production',
    founder_name TEXT NOT NULL DEFAULT 'Kurudi Bharath Kumar',
    founder_title TEXT NOT NULL DEFAULT 'Lead Filmmaker & Senior Colorist',
    phone TEXT NOT NULL DEFAULT '+91 9346227894',
    whatsapp_number TEXT NOT NULL DEFAULT '9346227894',
    email TEXT NOT NULL DEFAULT 'kbkfilms.official@gmail.com',
    location TEXT NOT NULL DEFAULT 'Hindupur, Andhra Pradesh, India',
    instagram_handle TEXT NOT NULL DEFAULT '@kbkfilms.official',
    instagram_url TEXT NOT NULL DEFAULT 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=f5nglc3',
    youtube_handle TEXT NOT NULL DEFAULT '@bharathkumarglp2003',
    youtube_url TEXT NOT NULL DEFAULT 'https://youtube.com/@bharathkumarglp2003?si=ai6BueJG5fmOkrGX',
    facebook_handle TEXT NOT NULL DEFAULT 'Kurudi Bharath Kumar',
    facebook_url TEXT NOT NULL DEFAULT 'https://facebook.com/KurudiBharathKumar',
    happy_clients_count INTEGER NOT NULL DEFAULT 800,
    films_delivered_count INTEGER NOT NULL DEFAULT 1200,
    years_experience INTEGER NOT NULL DEFAULT 6,
    satisfaction_rate NUMERIC(4, 1) NOT NULL DEFAULT 99.4,
    founder_bio TEXT NOT NULL DEFAULT 'Lead Filmmaker & Post-Production Colorist specializing in high-contrast cinematic wedding storytelling, dynamic pace-matching, and same-day on-venue spot edits.',
    degree TEXT NOT NULL DEFAULT 'B.Com (Computer Applications)',
    college TEXT NOT NULL DEFAULT 'Sri Krishnadevaraya University (SKU)',
    core_highlights JSONB NOT NULL DEFAULT '["Software & DB Logic", "Multimedia & Audio-Visual Systems", "Business Logistics & Film Distribution"]'::jsonb,
    current_pursuit TEXT NOT NULL DEFAULT 'MBA (2nd Year, Master of Business Administration)',
    editing_suites JSONB NOT NULL DEFAULT '["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects", "FilmConvert Nitrate", "Dehancer Pro"]'::jsonb,
    hero_video_url TEXT NOT NULL DEFAULT '/assets/hero-reel.mp4',
    hero_settled_poster_url TEXT NOT NULL DEFAULT '/assets/kbk-logo.jpg',
    price_disclaimer TEXT NOT NULL DEFAULT 'All prices are base estimates for standard multi-cam ceremonies. Final quotes may adjust slightly based on footage runtime, multi-cam angles, and express delivery requests.',
    terms_and_conditions JSONB NOT NULL DEFAULT '["25% advance required to lock calendar slot.", "Up to 3 complimentary revision rounds included.", "Raw footage archives preserved for 60 days following final master sign-off."]'::jsonb,
    contact_clarification_msg TEXT NOT NULL DEFAULT 'Studio Owner Kurudi Bharath Kumar directly oversees color grading and storyline sequencing for every client.',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. SERVICES CATALOGUE TABLE
CREATE TABLE IF NOT EXISTS public.services (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    short_description TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    price_type TEXT NOT NULL DEFAULT 'starting_from',
    base_price NUMERIC(12, 2) NOT NULL DEFAULT 14999,
    currency TEXT NOT NULL DEFAULT 'INR',
    price_label TEXT NOT NULL,
    inclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    exclusions JSONB NOT NULL DEFAULT '[]'::jsonb,
    turnaround_days INTEGER NOT NULL DEFAULT 5,
    featured BOOLEAN NOT NULL DEFAULT false,
    is_upcoming BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    badge TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. PUBLIC WORKS (PORTFOLIO SHOWCASE) TABLE
CREATE TABLE IF NOT EXISTS public.public_works (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    event_location TEXT NOT NULL DEFAULT 'Hindupur, AP',
    event_year TEXT NOT NULL DEFAULT '2026',
    thumbnail_url TEXT NOT NULL DEFAULT '/assets/kbk-logo.jpg',
    video_url TEXT NOT NULL DEFAULT '/assets/hero-reel.mp4',
    video_source_type TEXT NOT NULL DEFAULT 'direct_mp4',
    external_dest_url TEXT DEFAULT '',
    description TEXT DEFAULT '',
    software_used JSONB NOT NULL DEFAULT '["Premiere Pro", "DaVinci Resolve"]'::jsonb,
    is_featured BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    client_name TEXT NOT NULL,
    service_title TEXT NOT NULL DEFAULT 'Wedding Video Highlights',
    event_date TEXT NOT NULL DEFAULT '2026',
    location TEXT NOT NULL DEFAULT 'Hindupur, AP',
    rating INTEGER NOT NULL DEFAULT 5,
    review_text TEXT NOT NULL,
    video_url TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '/assets/kbk-logo.jpg',
    is_verified BOOLEAN NOT NULL DEFAULT true,
    is_published BOOLEAN NOT NULL DEFAULT true,
    booking_ref TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. CLIENTS DIRECTORY TABLE
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    city TEXT DEFAULT 'Hindupur, AP',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. BOOKING REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.booking_requests (
    id TEXT PRIMARY KEY,
    booking_ref TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT DEFAULT '',
    client_city TEXT DEFAULT 'Hindupur',
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    event_date TEXT NOT NULL,
    preferred_delivery_date TEXT DEFAULT '',
    budget_range TEXT DEFAULT '',
    footage_details TEXT DEFAULT '',
    reference_links TEXT DEFAULT '',
    custom_notes TEXT DEFAULT '',
    agreed_terms BOOLEAN NOT NULL DEFAULT true,
    price_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    quoted_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(12, 2),
    status TEXT NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. SERVICE PROJECTS (LIFECYCLE TRACKING) TABLE
CREATE TABLE IF NOT EXISTS public.service_projects (
    id TEXT PRIMARY KEY,
    booking_id TEXT NOT NULL,
    booking_ref TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT DEFAULT '',
    service_id TEXT NOT NULL,
    service_title TEXT NOT NULL,
    tracking_token TEXT NOT NULL,
    current_stage TEXT NOT NULL DEFAULT 'booking_requested',
    stage_progress_percent INTEGER NOT NULL DEFAULT 10,
    start_date TEXT NOT NULL DEFAULT CURRENT_DATE::text,
    estimated_delivery_date TEXT NOT NULL,
    actual_delivery_date TEXT,
    status_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    internal_notes TEXT DEFAULT '',
    client_messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    deliveries JSONB NOT NULL DEFAULT '[]'::jsonb,
    testimonial_id TEXT,
    is_overdue BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. CLIENT VIDEO DELIVERIES (ISOLATED PRIVATE LOCKER) TABLE
CREATE TABLE IF NOT EXISTS public.client_video_deliveries (
    id TEXT PRIMARY KEY,
    booking_ref TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    project_id TEXT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    video_url TEXT NOT NULL,
    video_source_type TEXT NOT NULL DEFAULT 'direct_mp4',
    thumbnail_url TEXT DEFAULT '/assets/kbk-logo.jpg',
    file_name TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_size_formatted TEXT DEFAULT '0 MB',
    mime_type TEXT NOT NULL DEFAULT 'video/mp4',
    file_category TEXT NOT NULL DEFAULT 'master_video',
    download_token TEXT NOT NULL,
    expiry_date TIMESTAMPTZ,
    download_count INTEGER NOT NULL DEFAULT 0,
    max_downloads INTEGER NOT NULL DEFAULT 50,
    is_streamable BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    owner_notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    actor_role TEXT NOT NULL DEFAULT 'owner',
    actor_name TEXT NOT NULL DEFAULT 'Kurudi Bharath Kumar',
    actor_identifier TEXT NOT NULL DEFAULT '9346227894',
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. AUTOMATION WORKFLOW LOGS & EXECUTIONS TABLE
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    id TEXT PRIMARY KEY,
    workflow_name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    action_taken TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ========================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_public_works_published ON public.public_works(is_published, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_booking_requests_ref ON public.booking_requests(booking_ref);
CREATE INDEX IF NOT EXISTS idx_service_projects_booking ON public.service_projects(booking_ref);
CREATE INDEX IF NOT EXISTS idx_client_video_deliveries_booking ON public.client_video_deliveries(booking_ref);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started ON public.workflow_executions(started_at DESC);

-- ========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================
ALTER TABLE public.owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.studio_cms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_video_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Permissive read/write access for frontend client sync
DROP POLICY IF EXISTS "Allow anon all public_works" ON public.public_works;
CREATE POLICY "Allow anon all public_works" ON public.public_works FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all testimonials" ON public.testimonials;
CREATE POLICY "Allow anon all testimonials" ON public.testimonials FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all services" ON public.services;
CREATE POLICY "Allow anon all services" ON public.services FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all studio_cms" ON public.studio_cms;
CREATE POLICY "Allow anon all studio_cms" ON public.studio_cms FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all booking_requests" ON public.booking_requests;
CREATE POLICY "Allow anon all booking_requests" ON public.booking_requests FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all service_projects" ON public.service_projects;
CREATE POLICY "Allow anon all service_projects" ON public.service_projects FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all client_video_deliveries" ON public.client_video_deliveries;
CREATE POLICY "Allow anon all client_video_deliveries" ON public.client_video_deliveries FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all owners" ON public.owners;
CREATE POLICY "Allow anon all owners" ON public.owners FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all audit_logs" ON public.audit_logs;
CREATE POLICY "Allow anon all audit_logs" ON public.audit_logs FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon all workflows" ON public.workflow_executions;
CREATE POLICY "Allow anon all workflows" ON public.workflow_executions FOR ALL TO anon, authenticated, service_role USING (true) WITH CHECK (true);

-- ========================================================================
-- ENABLE SUPABASE REALTIME REPLICATION
-- ========================================================================
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.services;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.public_works;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.testimonials;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.studio_cms;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_requests;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.service_projects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.client_video_deliveries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.workflow_executions;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ========================================================================
-- REAL CLIENT SHOWCASE FILMS SEED
-- ========================================================================
INSERT INTO public.public_works (
  id, title, category, event_location, event_year, thumbnail_url, video_url, video_source_type, external_dest_url, description, software_used, is_featured, is_published, sort_order
)
VALUES
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-000000000001',
    'Amulya Haldi Ceremony — Festive Highlights',
    'Haldi & Sangeeth Ceremonies',
    'Hindupur, AP',
    '2026',
    '/assets/founder.jpg',
    'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/preview',
    'google_drive',
    'https://drive.google.com/file/d/1dHZDL0B23QtW6yo6HK_MfcDTMHk4J6Dn/view',
    'Vibrant yellow splash color isolation, beat-matched family celebration, and warm festive energy captured in 4K.',
    '["DaVinci Resolve Studio", "Adobe Premiere Pro"]'::jsonb,
    true,
    true,
    1
  ),
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-000000000002',
    'Sangeetha & Aditya — Dynamic Sangeeth Celebration Night',
    'Haldi & Sangeeth Ceremonies',
    'Bengaluru / Hindupur',
    '2026',
    '/assets/founder.jpg',
    'https://drive.google.com/file/d/1rqVfAXvqzroASucfdilB3-sRVGk9811Y/preview',
    'google_drive',
    'https://drive.google.com/file/d/1rqVfAXvqzroASucfdilB3-sRVGk9811Y/view',
    'High-energy musical dance power of Sangeetha & Aditya Sangeeth celebration with punchy color grading and dynamic multicam pacing.',
    '["DaVinci Resolve Studio", "After Effects", "Premiere Pro"]'::jsonb,
    true,
    true,
    2
  ),
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-000000000003',
    'Hanumantha Roy & Gayathri — Grand Reception Highlights',
    'Wedding Highlights',
    'Hindupur, AP',
    '2026',
    '/assets/founder.jpg',
    'https://drive.google.com/file/d/1lmZ0mHo4lRI-Ie3452i-wrkM1uFC0jji/preview',
    'google_drive',
    'https://drive.google.com/file/d/1lmZ0mHo4lRI-Ie3452i-wrkM1uFC0jji/view',
    'Grand luxury reception film featuring multi-camera speech capture, cinematic slow-motion highlights, and rich HDR color grading.',
    '["DaVinci Resolve Studio", "Adobe Premiere Pro", "After Effects"]'::jsonb,
    true,
    true,
    3
  ),
  (
    'a1b2c3d4-e5f6-4a7b-8c9d-000000000004',
    'Cinematic Pre-Wedding Visual Story',
    'Pre-Wedding Video Editing',
    'Hindupur / Outdoor Scenic',
    '2026',
    '/assets/founder.jpg',
    'https://drive.google.com/file/d/1HQo2mJ2eszSMeSexO5wN2GxVMCTtJy2q/preview',
    'google_drive',
    'https://drive.google.com/file/d/1HQo2mJ2eszSMeSexO5wN2GxVMCTtJy2q/view',
    'Dreamy visual narrative with slow-motion couple portraits, warm cinematic tone mapping, and seamless storytelling.',
    '["DaVinci Resolve Studio", "Adobe Premiere Pro"]'::jsonb,
    true,
    true,
    4
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  video_url = EXCLUDED.video_url,
  category = EXCLUDED.category,
  external_dest_url = EXCLUDED.external_dest_url,
  description = EXCLUDED.description;

-- ========================================================================
-- SUPABASE STORAGE BUCKET INITIALIZATION & POLICIES
-- ========================================================================
DO $$
BEGIN
  -- 1. Create showcase_media bucket if not present
  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'showcase_media',
    'showcase_media',
    true,
    524288000, -- 500MB
    ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
  ON CONFLICT (id) DO UPDATE SET public = true;

  -- 2. Create deliveries bucket if not present
  INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('deliveries', 'deliveries', true, 1073741824) -- 1GB
  ON CONFLICT (id) DO UPDATE SET public = true;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Enable public read/write storage policies for showcase_media
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public showcase media read" ON storage.objects;
  CREATE POLICY "Public showcase media read" ON storage.objects
    FOR SELECT TO anon, authenticated, service_role USING (bucket_id IN ('showcase_media', 'deliveries'));

  DROP POLICY IF EXISTS "Public showcase media insert" ON storage.objects;
  CREATE POLICY "Public showcase media insert" ON storage.objects
    FOR INSERT TO anon, authenticated, service_role WITH CHECK (bucket_id IN ('showcase_media', 'deliveries'));

  DROP POLICY IF EXISTS "Public showcase media update" ON storage.objects;
  CREATE POLICY "Public showcase media update" ON storage.objects
    FOR UPDATE TO anon, authenticated, service_role USING (bucket_id IN ('showcase_media', 'deliveries'));

  DROP POLICY IF EXISTS "Public showcase media delete" ON storage.objects;
  CREATE POLICY "Public showcase media delete" ON storage.objects
    FOR DELETE TO anon, authenticated, service_role USING (bucket_id IN ('showcase_media', 'deliveries'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;



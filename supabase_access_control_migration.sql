-- KBK Films access-control hardening migration
-- Run once in the Supabase SQL Editor after the Vercel API environment variables
-- are set. This removes the current anonymous access to owners, client projects,
-- deliveries, and audit logs. Public catalogue reads and booking submission remain.

ALTER TABLE public.owners ADD COLUMN IF NOT EXISTS project_access JSONB NOT NULL DEFAULT '[]'::jsonb;

DROP POLICY IF EXISTS "Allow anon all owners" ON public.owners;
DROP POLICY IF EXISTS "Allow anon all service_projects" ON public.service_projects;
DROP POLICY IF EXISTS "Allow anon all client_video_deliveries" ON public.client_video_deliveries;
DROP POLICY IF EXISTS "Allow anon all audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow anon all booking_requests" ON public.booking_requests;

-- The anonymous browser may only submit a booking. Reads and management happen
-- through the server API using its service-role key and owner JWT checks.
CREATE POLICY "Public may submit bookings" ON public.booking_requests
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Do not create anon policies for owners, projects, deliveries, or audit logs.
-- The service-role key bypasses RLS; keep that key on the server only.


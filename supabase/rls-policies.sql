-- ================================================================
-- ROW LEVEL SECURITY POLICIES FOR ARAGÓN STARTUPS
-- ================================================================
--
-- IMPORTANT: This file fixes the "permission denied for table users" error
-- by using auth.jwt() instead of querying auth.users directly
--
-- Run this entire file in Supabase SQL Editor to fix RLS policies
-- ================================================================

-- ================================================================
-- STARTUPS TABLE POLICIES
-- ================================================================

-- First, disable and re-enable RLS to ensure clean state
ALTER TABLE public.startups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (old and new naming)
DROP POLICY IF EXISTS "Public can view approved startups" ON public.startups;
DROP POLICY IF EXISTS "Approved owners can view their own startup" ON public.startups;
DROP POLICY IF EXISTS "Approved owners can update their own startup" ON public.startups;
DROP POLICY IF EXISTS "Admins can view all startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can update all startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can insert startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can delete startups" ON public.startups;

-- Drop old policies from SUPABASE_SETUP.sql if they exist
DROP POLICY IF EXISTS "Allow public to view approved startups" ON public.startups;
DROP POLICY IF EXISTS "Allow startup owners to view their own startups" ON public.startups;
DROP POLICY IF EXISTS "Allow startup owners to update their own startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to view all startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to update all startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to insert startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to delete startups" ON public.startups;

-- Policy 1: Anyone (including anonymous) can view approved startups
CREATE POLICY "Public can view approved startups"
ON public.startups FOR SELECT
TO public
USING (is_approved = true);

-- Policy 2: Approved owners can view their own startup (even if not approved)
CREATE POLICY "Approved owners can view their own startup"
ON public.startups FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.startup_owners
    WHERE startup_owners.startup_id = startups.id
    AND startup_owners.user_id = auth.uid()
    AND startup_owners.approved = true
  )
);

-- Policy 3: Approved owners can update their own startup
CREATE POLICY "Approved owners can update their own startup"
ON public.startups FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.startup_owners
    WHERE startup_owners.startup_id = startups.id
    AND startup_owners.user_id = auth.uid()
    AND startup_owners.approved = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.startup_owners
    WHERE startup_owners.startup_id = startups.id
    AND startup_owners.user_id = auth.uid()
    AND startup_owners.approved = true
  )
);

-- Policy 4: Admins can view all startups
CREATE POLICY "Admins can view all startups"
ON public.startups FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy 5: Admins can update all startups
CREATE POLICY "Admins can update all startups"
ON public.startups FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy 6: Admins can insert startups
CREATE POLICY "Admins can insert startups"
ON public.startups FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy 7: Admins can delete startups
CREATE POLICY "Admins can delete startups"
ON public.startups FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- STARTUP_OWNERS TABLE POLICIES
-- ================================================================

-- Disable and re-enable RLS for clean state
ALTER TABLE public.startup_owners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_owners ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies (old and new naming)
DROP POLICY IF EXISTS "Users can view their own ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Entrepreneurs can create ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can view all ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can update ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can delete ownership records" ON public.startup_owners;

-- Drop old policies from SUPABASE_SETUP.sql if they exist
DROP POLICY IF EXISTS "Allow users to view their own ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow entrepreneurs to create ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to view all ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to update ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to delete ownership claims" ON public.startup_owners;

-- Policy 1: Users can view their own ownership records
CREATE POLICY "Users can view their own ownership records"
ON public.startup_owners FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Entrepreneurs can create ownership claims
CREATE POLICY "Entrepreneurs can create ownership claims"
ON public.startup_owners FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'entrepreneur'
);

-- Policy 3: Admins can view all ownership records
CREATE POLICY "Admins can view all ownership records"
ON public.startup_owners FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy 4: Admins can update ownership records (approve/reject)
CREATE POLICY "Admins can update ownership records"
ON public.startup_owners FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy 5: Admins can delete ownership records
CREATE POLICY "Admins can delete ownership records"
ON public.startup_owners FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- INDEXES FOR PERFORMANCE
-- ================================================================

-- Startups table indexes
CREATE INDEX IF NOT EXISTS idx_startups_is_approved ON public.startups(is_approved);
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_created_at ON public.startups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startups_tags ON public.startups USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_startups_ubicacion ON public.startups(ubicacion);

-- Startup_owners table indexes
CREATE INDEX IF NOT EXISTS idx_startup_owners_user_id ON public.startup_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_startup_id ON public.startup_owners(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_approved ON public.startup_owners(approved);
CREATE INDEX IF NOT EXISTS idx_startup_owners_user_startup ON public.startup_owners(user_id, startup_id);

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================

-- Verify policies were created
-- SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- AND tablename IN ('startups', 'startup_owners')
-- ORDER BY tablename, policyname;

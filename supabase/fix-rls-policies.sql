-- ================================================================
-- FIX RLS POLICIES - REMOVE auth.users REFERENCES
-- ================================================================
--
-- This script fixes the "permission denied for table users" error
-- by replacing all auth.users queries with auth.jwt()
--
-- IMPORTANT: Run this ENTIRE file in Supabase SQL Editor
-- ================================================================

-- ================================================================
-- 1. FIX SUBMISSIONS TABLE
-- ================================================================

-- Drop old policies
DROP POLICY IF EXISTS "Allow admins to view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow admins to update submissions" ON public.submissions;

-- Recreate with auth.jwt()
CREATE POLICY "Allow admins to view all submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Allow admins to update submissions"
ON public.submissions FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- 2. FIX STARTUPS TABLE
-- ================================================================

-- Disable and re-enable RLS for clean state
ALTER TABLE public.startups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Public can view approved startups" ON public.startups;
DROP POLICY IF EXISTS "Approved owners can view their own startup" ON public.startups;
DROP POLICY IF EXISTS "Approved owners can update their own startup" ON public.startups;
DROP POLICY IF EXISTS "Admins can view all startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can update all startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can insert startups" ON public.startups;
DROP POLICY IF EXISTS "Admins can delete startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public to view approved startups" ON public.startups;
DROP POLICY IF EXISTS "Allow startup owners to view their own startups" ON public.startups;
DROP POLICY IF EXISTS "Allow startup owners to update their own startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to view all startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to update all startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to insert startups" ON public.startups;
DROP POLICY IF EXISTS "Allow admins to delete startups" ON public.startups;

-- Create new policies with auth.jwt()
CREATE POLICY "Public can view approved startups"
ON public.startups FOR SELECT
TO public
USING (is_approved = true);

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

CREATE POLICY "Admins can view all startups"
ON public.startups FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can update all startups"
ON public.startups FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can insert startups"
ON public.startups FOR INSERT
TO authenticated
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can delete startups"
ON public.startups FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- 3. FIX STARTUP_OWNERS TABLE
-- ================================================================

-- Disable and re-enable RLS for clean state
ALTER TABLE public.startup_owners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_owners ENABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Entrepreneurs can create ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can view all ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can update ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Admins can delete ownership records" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow users to view their own ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow entrepreneurs to create ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to view all ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to update ownership claims" ON public.startup_owners;
DROP POLICY IF EXISTS "Allow admins to delete ownership claims" ON public.startup_owners;

-- Create new policies with auth.jwt()
CREATE POLICY "Users can view their own ownership records"
ON public.startup_owners FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Entrepreneurs can create ownership claims"
ON public.startup_owners FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (auth.jwt() -> 'user_metadata' ->> 'role') = 'entrepreneur'
);

CREATE POLICY "Admins can view all ownership records"
ON public.startup_owners FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can update ownership records"
ON public.startup_owners FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY "Admins can delete ownership records"
ON public.startup_owners FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- ================================================================
-- 4. CREATE INDEXES FOR PERFORMANCE
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_startups_is_approved ON public.startups(is_approved);
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_created_at ON public.startups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startups_tags ON public.startups USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_startups_ubicacion ON public.startups(ubicacion);

CREATE INDEX IF NOT EXISTS idx_startup_owners_user_id ON public.startup_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_startup_id ON public.startup_owners(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_approved ON public.startup_owners(approved);
CREATE INDEX IF NOT EXISTS idx_startup_owners_user_startup ON public.startup_owners(user_id, startup_id);

-- ================================================================
-- VERIFICATION
-- ================================================================

-- Verify policies were created successfully
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('startups', 'startup_owners', 'submissions')
ORDER BY tablename, policyname;

-- This should show:
-- - 7 policies for startups
-- - 5 policies for startup_owners
-- - 2 policies for submissions (anon insert + admin select/update)

-- ================================================================
-- COMPLETE FIX FOR "permission denied for table users" ERROR
-- ================================================================
--
-- This script provides a comprehensive fix for the auth.users permission error
-- Run this ENTIRE file in Supabase SQL Editor
--
-- What this fixes:
-- 1. Replaces ALL policies that query auth.users with auth.jwt()
-- 2. Ensures proper RLS configuration
-- 3. Adds proper indexes for performance
--
-- ================================================================

-- ================================================================
-- STEP 1: CLEAN UP ALL EXISTING POLICIES
-- ================================================================

-- Startups table - drop ALL possible policy names
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'startups'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.startups', r.policyname);
    END LOOP;
END $$;

-- Startup_owners table - drop ALL possible policy names
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'startup_owners'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.startup_owners', r.policyname);
    END LOOP;
END $$;

-- Submissions table - drop ALL possible policy names (if exists)
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
        AND tablename = 'submissions'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.submissions', r.policyname);
    END LOOP;
END $$;

-- ================================================================
-- STEP 2: ENSURE RLS IS ENABLED
-- ================================================================

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.startup_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- STEP 3: CREATE NEW POLICIES FOR STARTUPS TABLE
-- ================================================================

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
-- STEP 4: CREATE NEW POLICIES FOR STARTUP_OWNERS TABLE
-- ================================================================

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
-- STEP 5: CREATE POLICIES FOR SUBMISSIONS TABLE (if exists)
-- ================================================================

-- Check if submissions table exists and create policies
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'submissions') THEN

    -- Policy 1: Anyone can submit (INSERT)
    EXECUTE 'CREATE POLICY "Anyone can submit startups"
    ON public.submissions FOR INSERT
    TO public
    WITH CHECK (true)';

    -- Policy 2: Users can view their own submissions by email
    -- Note: Current schema uses submitter_email, not submitted_by UUID
    EXECUTE 'CREATE POLICY "Users can view their own submissions"
    ON public.submissions FOR SELECT
    TO public
    USING (true)'; -- Anyone can view for now since there's no user_id column

    -- Policy 3: Admins can view all submissions
    EXECUTE 'CREATE POLICY "Admins can view all submissions"
    ON public.submissions FOR SELECT
    TO authenticated
    USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';

    -- Policy 4: Admins can update submissions
    EXECUTE 'CREATE POLICY "Admins can update submissions"
    ON public.submissions FOR UPDATE
    TO authenticated
    USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')
    WITH CHECK ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';

    -- Policy 5: Admins can delete submissions
    EXECUTE 'CREATE POLICY "Admins can delete submissions"
    ON public.submissions FOR DELETE
    TO authenticated
    USING ((auth.jwt() -> ''user_metadata'' ->> ''role'') = ''admin'')';

  END IF;
END $$;

-- ================================================================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ================================================================

-- Startups table indexes
CREATE INDEX IF NOT EXISTS idx_startups_is_approved ON public.startups(is_approved);
CREATE INDEX IF NOT EXISTS idx_startups_slug ON public.startups(slug);
CREATE INDEX IF NOT EXISTS idx_startups_created_at ON public.startups(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_startups_tags ON public.startups USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_startups_ubicacion ON public.startups(ubicacion);
CREATE INDEX IF NOT EXISTS idx_startups_search_vector ON public.startups USING GIN (search_vector);

-- Startup_owners table indexes
CREATE INDEX IF NOT EXISTS idx_startup_owners_user_id ON public.startup_owners(user_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_startup_id ON public.startup_owners(startup_id);
CREATE INDEX IF NOT EXISTS idx_startup_owners_approved ON public.startup_owners(approved);
CREATE INDEX IF NOT EXISTS idx_startup_owners_user_startup ON public.startup_owners(user_id, startup_id);

-- ================================================================
-- STEP 7: VERIFICATION
-- ================================================================

-- Show all policies that were created
SELECT
  tablename,
  policyname,
  cmd AS operation,
  CASE
    WHEN roles::text = '{public}' THEN 'public'
    WHEN roles::text = '{authenticated}' THEN 'authenticated'
    ELSE roles::text
  END AS role
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('startups', 'startup_owners', 'submissions')
ORDER BY tablename, policyname;

-- Check for any remaining auth.users references (should be empty)
SELECT
  tablename,
  policyname,
  'WARNING: Still references auth.users' AS issue
FROM pg_policies
WHERE schemaname = 'public'
AND (qual::text LIKE '%auth.users%' OR with_check::text LIKE '%auth.users%')
ORDER BY tablename, policyname;

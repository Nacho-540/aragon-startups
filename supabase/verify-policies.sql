-- ================================================================
-- VERIFY CURRENT RLS POLICIES
-- ================================================================
--
-- Run this query to see all active policies and check for auth.users
-- ================================================================

-- 1. Show all policies for our tables
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('startups', 'startup_owners', 'submissions')
ORDER BY tablename, policyname;

-- 2. Check if any policy definition contains 'auth.users'
SELECT
  tablename,
  policyname,
  'qual: ' || qual as definition
FROM pg_policies
WHERE schemaname = 'public'
AND (qual LIKE '%auth.users%' OR with_check LIKE '%auth.users%')
ORDER BY tablename, policyname;

-- 3. Show RLS status for each table
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('startups', 'startup_owners', 'submissions');

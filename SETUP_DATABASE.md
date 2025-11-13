# Database Setup Instructions

## Problem Fixed

The logo upload error has been **completely resolved**. The issue was due to permission problems with Supabase Storage.

### What was fixed:
1. ✅ Created `createServiceClient()` function using `SERVICE_ROLE_KEY` for storage operations
2. ✅ Updated both APIs to use the service client for logo and pitch deck uploads
3. ✅ Verified storage buckets exist and are properly configured

## Remaining Issue: Database Schema

There's a **schema mismatch** between the code and the `submissions` table in Supabase. The table needs to be created or updated with the correct schema.

### Solution: Execute SQL in Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **hkamkmqvbaqgglcfkbia**
3. Navigate to: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Copy and paste the contents of: `supabase/schema.sql`
6. Click: **Run** (or press Ctrl/Cmd + Enter)

### What the SQL does:

- Creates the `submissions` table with the correct schema
- Sets up proper indexes for performance
- Configures Row Level Security (RLS) policies:
  - Allows anonymous users to submit startups
  - Allows admins to view and manage submissions
- Creates triggers for automatic `updated_at` timestamp updates

### Key Schema Details:

**Important:** The column is named `ano_fundacion` (without ñ) instead of `año_fundacion` to avoid PostgreSQL character encoding issues. The frontend still uses `año_fundacion` in form fields, but the backend maps it to `ano_fundacion` when saving to the database.

### After Running the SQL:

The complete submission flow will work:
1. ✅ User fills out the 5-step form
2. ✅ Logo uploads successfully to Supabase Storage
3. ✅ Pitch deck uploads successfully (if provided)
4. ✅ Submission saves to database with status 'pending'
5. ✅ Admin can review and approve/reject submissions

### Testing:

After setting up the database, test the form at: http://localhost:3000/submit

The form should complete all 5 steps and successfully submit without errors.

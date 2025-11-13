-- Add admin_notes column to submissions table
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add comment to document the column
COMMENT ON COLUMN public.submissions.admin_notes IS 'Notes added by administrators when reviewing submissions';

-- Create submissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

  -- Basic Information
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion_breve TEXT NOT NULL,
  descripcion_larga TEXT NOT NULL,
  logo_url TEXT,

  -- Company Details
  ano_fundacion INTEGER NOT NULL,
  ubicacion TEXT NOT NULL,
  tags TEXT[] NOT NULL DEFAULT '{}',
  num_empleados TEXT,
  estado TEXT NOT NULL DEFAULT 'active',

  -- Contact & Links
  web TEXT,
  email TEXT,
  phone TEXT,
  redes_sociales JSONB DEFAULT '{}'::jsonb,

  -- Funding & Pitch
  inversion_recibida TEXT,
  pitch_deck_url TEXT,

  -- Submitter Info
  submitter_email TEXT NOT NULL,

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  admin_notes TEXT,

  -- Audit
  approved_startup_id UUID REFERENCES public.startups(id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON public.submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_slug ON public.submissions(slug);
CREATE INDEX IF NOT EXISTS idx_submissions_submitter_email ON public.submissions(submitter_email);

-- Enable Row Level Security
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous users to insert submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow admins to view all submissions" ON public.submissions;
DROP POLICY IF EXISTS "Allow admins to update submissions" ON public.submissions;

-- Policy: Allow anyone to submit (insert)
CREATE POLICY "Allow anonymous users to insert submissions"
ON public.submissions FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Only admins can view all submissions
CREATE POLICY "Allow admins to view all submissions"
ON public.submissions FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Policy: Only admins can update submissions
CREATE POLICY "Allow admins to update submissions"
ON public.submissions FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
)
WITH CHECK (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_submissions_updated_at ON public.submissions;

CREATE TRIGGER update_submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Storage policies for startup-logos bucket
-- Allows anonymous users to upload files for submissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow anonymous uploads to startup-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access to startup-logos" ON storage.objects;
DROP POLICY IF EXISTS "Allow anonymous uploads to pitch-decks" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated read access to pitch-decks" ON storage.objects;

-- Startup Logos bucket policies
-- Allow anyone to upload logos (for submission forms)
CREATE POLICY "Allow anonymous uploads to startup-logos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'startup-logos');

-- Allow public read access to logos
CREATE POLICY "Allow public read access to startup-logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'startup-logos');

-- Pitch Decks bucket policies
-- Allow anyone to upload pitch decks (for submission forms)
CREATE POLICY "Allow anonymous uploads to pitch-decks"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'pitch-decks');

-- Allow authenticated users (investors) to read pitch decks
CREATE POLICY "Allow authenticated read access to pitch-decks"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'pitch-decks');

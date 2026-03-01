-- Supabase Storage Configuration for Zweren Ph
-- This script creates the 'menu-images' bucket and sets up RLS policies.

-- 1. Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'menu-images', 'menu-images', true
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'menu-images'
);

-- 2. Storage Policies
-- Allow public access to all images (Required for users to see product/logo images)
DO $$ BEGIN
    CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'menu-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow public uploads (Simplified pattern for this setup, but generally should be authenticated)
DO $$ BEGIN
    CREATE POLICY "Public Uploads"
    ON storage.objects FOR INSERT
    TO public
    WITH CHECK (bucket_id = 'menu-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow public updates/deletes (Required for Admin Dashboard image management)
DO $$ BEGIN
    CREATE POLICY "Public Manage"
    ON storage.objects FOR UPDATE
    TO public
    USING (bucket_id = 'menu-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE POLICY "Public Delete"
    ON storage.objects FOR DELETE
    TO public
    USING (bucket_id = 'menu-images');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

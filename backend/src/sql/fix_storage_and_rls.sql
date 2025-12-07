-- Create avatars bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS for avatars bucket
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update their own avatar" ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can upload an avatar"
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' );

CREATE POLICY "Anyone can update their own avatar"
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1] );

-- Ensure exchanges table exists (basic structure based on usage)
CREATE TABLE IF NOT EXISTS public.exchanges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposer_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  skill_id_offered UUID REFERENCES public.skills(id),
  skill_id_requested UUID REFERENCES public.skills(id),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on exchanges
ALTER TABLE public.exchanges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exchanges
DROP POLICY IF EXISTS "Users can view their own exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Users can create exchanges" ON public.exchanges;
DROP POLICY IF EXISTS "Users can update their own exchanges" ON public.exchanges;

CREATE POLICY "Users can view their own exchanges"
  ON public.exchanges FOR SELECT
  USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create exchanges"
  ON public.exchanges FOR INSERT
  WITH CHECK (auth.uid() = proposer_id);

CREATE POLICY "Users can update their own exchanges"
  ON public.exchanges FOR UPDATE
  USING (auth.uid() = proposer_id OR auth.uid() = receiver_id);

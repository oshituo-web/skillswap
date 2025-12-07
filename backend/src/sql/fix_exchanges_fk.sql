-- Add foreign key constraints to the exchanges table to enable joins
-- This fixes the "Could not find a relationship" error (PGRST200)

-- Add foreign key for proposer_id linking to profiles
ALTER TABLE public.exchanges
DROP CONSTRAINT IF EXISTS exchanges_proposer_id_fkey;

ALTER TABLE public.exchanges
ADD CONSTRAINT exchanges_proposer_id_fkey
FOREIGN KEY (proposer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key for receiver_id linking to profiles
ALTER TABLE public.exchanges
DROP CONSTRAINT IF EXISTS exchanges_receiver_id_fkey;

ALTER TABLE public.exchanges
ADD CONSTRAINT exchanges_receiver_id_fkey
FOREIGN KEY (receiver_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add foreign key for skill_id_offered linking to skills
ALTER TABLE public.exchanges
DROP CONSTRAINT IF EXISTS exchanges_skill_id_offered_fkey;

ALTER TABLE public.exchanges
ADD CONSTRAINT exchanges_skill_id_offered_fkey
FOREIGN KEY (skill_id_offered)
REFERENCES public.skills(id)
ON DELETE SET NULL;

-- Add foreign key for skill_id_requested linking to skills
ALTER TABLE public.exchanges
DROP CONSTRAINT IF EXISTS exchanges_skill_id_requested_fkey;

ALTER TABLE public.exchanges
ADD CONSTRAINT exchanges_skill_id_requested_fkey
FOREIGN KEY (skill_id_requested)
REFERENCES public.skills(id)
ON DELETE SET NULL;

-- Notify that the migration is complete
DO $$
BEGIN
    RAISE NOTICE 'Foreign keys for exchanges table have been successfully added.';
END $$;

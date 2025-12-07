-- Fix notifications table schema to match backend and frontend expectations

-- Rename is_read to read to match frontend/backend code
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'is_read') THEN
        ALTER TABLE public.notifications RENAME COLUMN is_read TO read;
    END IF;
END $$;

-- Add title column if it doesn't exist
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add metadata column if it doesn't exist
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Notify completion
DO $$
BEGIN
    RAISE NOTICE 'Notifications table schema updated successfully.';
END $$;

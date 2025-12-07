-- Add presence system for online/offline status tracking
-- Run this migration to enable user presence features

-- Create user_presence table
CREATE TABLE IF NOT EXISTS user_presence (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view user presence" ON user_presence;
DROP POLICY IF EXISTS "Users can update own presence" ON user_presence;
DROP POLICY IF EXISTS "Users can insert own presence" ON user_presence;

-- Policy: Everyone can view presence (public information)
CREATE POLICY "Anyone can view user presence" 
  ON user_presence FOR SELECT 
  USING (true);

-- Policy: Users can update their own presence
CREATE POLICY "Users can update own presence" 
  ON user_presence FOR UPDATE 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own presence
CREATE POLICY "Users can insert own presence" 
  ON user_presence FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Enable Realtime for instant presence updates
ALTER TABLE user_presence REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;

-- Create function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(p_user_id UUID, p_status TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO user_presence (user_id, status, last_seen, updated_at)
  VALUES (p_user_id, p_status, NOW(), NOW())
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    status = p_status,
    last_seen = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_presence_status ON user_presence(status);
CREATE INDEX IF NOT EXISTS idx_user_presence_last_seen ON user_presence(last_seen);

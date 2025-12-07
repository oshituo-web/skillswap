-- Enable Realtime for chat tables
-- This allows Supabase to broadcast changes in real-time

-- Enable replica identity for messages table (required for Realtime)
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Add messages table to the realtime publication
-- This tells Supabase to broadcast INSERT/UPDATE/DELETE events
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

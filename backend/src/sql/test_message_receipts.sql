-- Test script to check if message receipt functions exist and work
-- Run this in Supabase SQL Editor to verify the setup

-- 1. Check if delivered_at column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND column_name IN ('delivered_at', 'read_at');

-- 2. Check if functions exist
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_name IN ('mark_message_delivered', 'mark_message_read', 'mark_conversation_read')
  AND routine_schema = 'public';

-- 3. Check if user_presence table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'user_presence';

-- 4. Check sample messages to see their receipt status
SELECT id, sender_id, content, delivered_at, read_at, created_at
FROM messages
ORDER BY created_at DESC
LIMIT 5;

-- 5. Test marking a message as delivered (replace with actual message ID)
-- SELECT mark_message_delivered('your-message-id-here');

-- 6. Test marking a message as read (replace with actual message ID)
-- SELECT mark_message_read('your-message-id-here');

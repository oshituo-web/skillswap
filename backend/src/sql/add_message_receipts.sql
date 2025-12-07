-- Add message delivery and read receipt tracking
-- Run this migration to enable message receipt features

-- Add delivered_at column to messages table
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

-- read_at column should already exist from chat_schema.sql
-- If not, uncomment the line below:
-- ALTER TABLE messages ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_delivered_at ON messages(delivered_at);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- Create function to mark message as delivered
CREATE OR REPLACE FUNCTION mark_message_delivered(p_message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages 
  SET delivered_at = NOW() 
  WHERE id = p_message_id 
    AND delivered_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark message as read
CREATE OR REPLACE FUNCTION mark_message_read(p_message_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE messages 
  SET 
    read_at = NOW(),
    delivered_at = COALESCE(delivered_at, NOW()) -- Also mark as delivered if not already
  WHERE id = p_message_id 
    AND read_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to mark all messages in a conversation as read
CREATE OR REPLACE FUNCTION mark_conversation_read(p_conversation_id UUID, p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE messages 
  SET 
    read_at = NOW(),
    delivered_at = COALESCE(delivered_at, NOW())
  WHERE conversation_id = p_conversation_id 
    AND sender_id != p_user_id -- Don't mark own messages as read
    AND read_at IS NULL;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

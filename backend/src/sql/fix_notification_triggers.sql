-- Fix notification triggers to remove reference to non-existent 'email' column in profiles table

-- Update notify_new_message function
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    recipient_id UUID;
    sender_name TEXT;
BEGIN
    -- Get the recipient (the other participant in the conversation)
    SELECT CASE 
        WHEN participant1_id = NEW.sender_id THEN participant2_id
        ELSE participant1_id
    END INTO recipient_id
    FROM conversations
    WHERE id = NEW.conversation_id;
    
    -- Get sender's name (removed email fallback)
    SELECT COALESCE(full_name, username, 'Unknown User') INTO sender_name
    FROM profiles
    WHERE id = NEW.sender_id;
    
    -- Create notification
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
        recipient_id,
        'message',
        'New Message',
        sender_name || ' sent you a message',
        '/chat',
        jsonb_build_object('sender_id', NEW.sender_id, 'conversation_id', NEW.conversation_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notify_exchange_event function
CREATE OR REPLACE FUNCTION notify_exchange_event()
RETURNS TRIGGER AS $$
DECLARE
    proposer_name TEXT;
    receiver_name TEXT;
    skill_name TEXT;
BEGIN
    -- Get names (removed email fallback)
    SELECT COALESCE(full_name, username, 'Unknown User') INTO proposer_name
    FROM profiles WHERE id = NEW.proposer_id;
    
    SELECT COALESCE(full_name, username, 'Unknown User') INTO receiver_name
    FROM profiles WHERE id = NEW.receiver_id;
    
    -- Get skill name
    SELECT name INTO skill_name
    FROM skills WHERE id = NEW.skill_id_requested;
    
    -- Handle INSERT (new exchange request)
    IF TG_OP = 'INSERT' THEN
        -- Notify the receiver (provider of the skill)
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            NEW.receiver_id,
            'exchange_request',
            'New Exchange Request',
            proposer_name || ' wants to learn ' || skill_name,
            '/dashboard',
            jsonb_build_object('exchange_id', NEW.id, 'proposer_id', NEW.proposer_id)
        );
    
    -- Handle UPDATE (status change)
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Notify proposer of status change
        IF NEW.status = 'accepted' THEN
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                NEW.proposer_id,
                'exchange_update',
                'Exchange Accepted',
                receiver_name || ' accepted your exchange request for ' || skill_name,
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                NEW.proposer_id,
                'exchange_update',
                'Exchange Declined',
                receiver_name || ' declined your exchange request for ' || skill_name,
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        ELSIF NEW.status = 'completed' THEN
            -- Notify both parties
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES 
            (
                NEW.proposer_id,
                'exchange_update',
                'Exchange Completed',
                'Your exchange with ' || receiver_name || ' is complete. Leave a review!',
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            ),
            (
                NEW.receiver_id,
                'exchange_update',
                'Exchange Completed',
                'Your exchange with ' || proposer_name || ' is complete. Leave a review!',
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notify_new_review function
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
    reviewer_name TEXT;
BEGIN
    -- Get reviewer's name (removed email fallback)
    SELECT COALESCE(full_name, username, 'Unknown User') INTO reviewer_name
    FROM profiles
    WHERE id = NEW.reviewer_id;
    
    -- Create notification for the reviewed user
    INSERT INTO notifications (user_id, type, title, message, link, metadata)
    VALUES (
        NEW.reviewed_user_id,
        'review',
        'New Review',
        reviewer_name || ' left you a ' || NEW.rating || '-star review',
        '/profile/' || NEW.reviewed_user_id,
        jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating, 'reviewer_id', NEW.reviewer_id)
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $$
BEGIN
    RAISE NOTICE 'Notification triggers updated successfully.';
END $$;

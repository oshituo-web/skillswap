-- =====================================================
-- NOTIFICATION TRIGGERS
-- Automatically create notifications for key events
-- =====================================================

-- Function to create notification for new message
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
    
    -- Get sender's name
    SELECT COALESCE(full_name, username, email) INTO sender_name
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
$$ LANGUAGE plpgsql;

-- Trigger for new messages
DROP TRIGGER IF EXISTS trigger_new_message_notification ON messages;
CREATE TRIGGER trigger_new_message_notification
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_new_message();

-- =====================================================

-- Function to create notification for exchange events
CREATE OR REPLACE FUNCTION notify_exchange_event()
RETURNS TRIGGER AS $$
DECLARE
    requester_name TEXT;
    provider_name TEXT;
    skill_name TEXT;
BEGIN
    -- Get names
    SELECT COALESCE(full_name, username, email) INTO requester_name
    FROM profiles WHERE id = NEW.requester_id;
    
    SELECT COALESCE(full_name, username, email) INTO provider_name
    FROM profiles WHERE id = NEW.provider_id;
    
    SELECT name INTO skill_name
    FROM skills WHERE id = NEW.skill_id;
    
    -- Handle INSERT (new exchange request)
    IF TG_OP = 'INSERT' THEN
        -- Notify the provider
        INSERT INTO notifications (user_id, type, title, message, link, metadata)
        VALUES (
            NEW.provider_id,
            'exchange_request',
            'New Exchange Request',
            requester_name || ' wants to learn ' || skill_name,
            '/dashboard',
            jsonb_build_object('exchange_id', NEW.id, 'requester_id', NEW.requester_id)
        );
    
    -- Handle UPDATE (status change)
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        -- Notify requester of status change
        IF NEW.status = 'accepted' THEN
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                NEW.requester_id,
                'exchange_update',
                'Exchange Accepted',
                provider_name || ' accepted your exchange request for ' || skill_name,
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES (
                NEW.requester_id,
                'exchange_update',
                'Exchange Declined',
                provider_name || ' declined your exchange request for ' || skill_name,
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        ELSIF NEW.status = 'completed' THEN
            -- Notify both parties
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES 
            (
                NEW.requester_id,
                'exchange_update',
                'Exchange Completed',
                'Your exchange with ' || provider_name || ' is complete. Leave a review!',
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            ),
            (
                NEW.provider_id,
                'exchange_update',
                'Exchange Completed',
                'Your exchange with ' || requester_name || ' is complete. Leave a review!',
                '/dashboard',
                jsonb_build_object('exchange_id', NEW.id, 'status', NEW.status)
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for exchange events
DROP TRIGGER IF EXISTS trigger_exchange_notification ON exchanges;
CREATE TRIGGER trigger_exchange_notification
AFTER INSERT OR UPDATE ON exchanges
FOR EACH ROW
EXECUTE FUNCTION notify_exchange_event();

-- =====================================================

-- Function to create notification for new review
CREATE OR REPLACE FUNCTION notify_new_review()
RETURNS TRIGGER AS $$
DECLARE
    reviewer_name TEXT;
BEGIN
    -- Get reviewer's name
    SELECT COALESCE(full_name, username, email) INTO reviewer_name
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
$$ LANGUAGE plpgsql;

-- Trigger for new reviews
DROP TRIGGER IF EXISTS trigger_new_review_notification ON reviews;
CREATE TRIGGER trigger_new_review_notification
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_new_review();

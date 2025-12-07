import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase, adminSupabase } from '../lib/supabaseClient';

const router = express.Router();

// Create or get existing conversation
router.post('/conversations', authMiddleware, async (req, res) => {
    try {
        const { participantId } = req.body;
        const user = (req as any).user;

        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if conversation already exists
        const { data: existingConv, error: fetchError } = await adminSupabase
            .from('conversations')
            .select('*')
            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
            .single();

        if (existingConv) {
            return res.json(existingConv);
        }

        // Create new conversation
        const { data: newConv, error: createError } = await adminSupabase
            .from('conversations')
            .insert([{
                participant1_id: user.id,
                participant2_id: participantId,
                updated_at: new Date()
            }])
            .select()
            .single();

        if (createError) throw createError;
        res.status(201).json(newConv);

    } catch (error) {
        console.error('Error creating conversation:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error });
    }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await adminSupabase
            .from('conversations')
            .select(`
                *,
                participant1:profiles!participant1_id(username, full_name, avatar_url, email),
                participant2:profiles!participant2_id(username, full_name, avatar_url, email)
            `)
            .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get messages for a conversation
router.get('/conversations/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await adminSupabase
            .from('messages')
            .select('*')
            .eq('conversation_id', id)
            .order('created_at', { ascending: true });

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Send a message
router.post('/messages', authMiddleware, async (req, res) => {
    try {
        const { conversation_id, content } = req.body;
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await adminSupabase
            .from('messages')
            .insert([{
                conversation_id,
                sender_id: user.id,
                content
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);

    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ===== PRESENCE ENDPOINTS =====

// Update user presence (online/offline)
router.put('/presence', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        if (!['online', 'offline'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be "online" or "offline"' });
        }

        const { error } = await adminSupabase.rpc('update_user_presence', {
            p_user_id: user.id,
            p_status: status
        });

        if (error) throw error;
        res.json({ success: true, status });

    } catch (error) {
        console.error('Error updating presence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get user presence
router.get('/presence/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await adminSupabase
            .from('user_presence')
            .select('status, last_seen')
            .eq('user_id', userId)
            .single();

        if (error) {
            // If no presence record, user is offline
            return res.json({ status: 'offline', last_seen: null });
        }

        res.json(data);

    } catch (error) {
        console.error('Error fetching presence:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ===== MESSAGE RECEIPT ENDPOINTS =====

// Mark message as delivered
router.patch('/messages/:id/delivered', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Verify user is a participant in the conversation
        const { data: message } = await adminSupabase
            .from('messages')
            .select('conversation_id, sender_id')
            .eq('id', id)
            .single();

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Don't mark own messages as delivered
        if (message.sender_id === user.id) {
            return res.json({ success: true, message: 'Cannot mark own message as delivered' });
        }

        const { error } = await adminSupabase.rpc('mark_message_delivered', {
            p_message_id: id
        });

        if (error) throw error;
        res.json({ success: true });

    } catch (error) {
        console.error('Error marking message as delivered:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark message as read
router.patch('/messages/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Verify user is a participant in the conversation
        const { data: message } = await adminSupabase
            .from('messages')
            .select('conversation_id, sender_id')
            .eq('id', id)
            .single();

        if (!message) {
            return res.status(404).json({ error: 'Message not found' });
        }

        // Don't mark own messages as read
        if (message.sender_id === user.id) {
            return res.json({ success: true, message: 'Cannot mark own message as read' });
        }

        const { error } = await adminSupabase.rpc('mark_message_read', {
            p_message_id: id
        });

        if (error) throw error;
        res.json({ success: true });

    } catch (error) {
        console.error('Error marking message as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark all messages in conversation as read
router.patch('/conversations/:id/read-all', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data: count, error } = await adminSupabase.rpc('mark_conversation_read', {
            p_conversation_id: id,
            p_user_id: user.id
        });

        if (error) throw error;
        res.json({ success: true, count });

    } catch (error) {
        console.error('Error marking conversation as read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get unread chat count
router.get('/unread', authMiddleware, async (req, res) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Count unread messages in conversations where I am a participant
        // This is complex because we need to join conversations and messages
        // Simplified approach: Count messages where I am the receiver and read_at is null

        // Note: This assumes 1-on-1 chats for simplicity. 
        // For group chats, we'd need a separate read_receipts table.
        // Given the current schema has read_at on the message itself, it implies 1-on-1.

        const { count, error } = await adminSupabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .neq('sender_id', user.id) // Messages sent by others
            .is('read_at', null);      // That are unread

        if (error) throw error;

        res.json({ count: count || 0 });

    } catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

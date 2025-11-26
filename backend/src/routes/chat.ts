import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Create or get existing conversation
router.post('/conversations', authMiddleware, async (req, res) => {
    try {
        const { participantId } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if conversation already exists
        const { data: existingConv, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${participantId}),and(participant1_id.eq.${participantId},participant2_id.eq.${user.id})`)
            .single();

        if (existingConv) {
            return res.json(existingConv);
        }

        // Create new conversation
        const { data: newConv, error: createError } = await supabase
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
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all conversations for current user
router.get('/conversations', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                participant1:profiles!participant1_id(username, full_name, avatar_url),
                participant2:profiles!participant2_id(username, full_name, avatar_url)
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
        const { data, error } = await supabase
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
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
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

export default router;

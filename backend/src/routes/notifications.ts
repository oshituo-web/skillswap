import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Get all notifications for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark a notification as read
router.patch('/:id/read', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', id)
            .eq('user_id', user.id) // Ensure user owns the notification
            .select()
            .single();

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Error updating notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Mark all notifications as read
router.patch('/read-all', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)
            .select();

        if (error) throw error;
        res.json(data);

    } catch (error) {
        console.error('Error marking all read:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Send a notification (Internal/Admin use)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { user_id, type, title, message, link, metadata } = req.body;

        // In a real app, you might want to restrict this to admins or system events

        const { data, error } = await supabase
            .from('notifications')
            .insert([{
                user_id,
                type,
                title,
                message,
                link,
                metadata,
                read: false
            }])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);

    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

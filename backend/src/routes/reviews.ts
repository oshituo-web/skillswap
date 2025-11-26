import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Create a review
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { reviewee_id, exchange_id, rating, comment } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Basic validation
        if (!reviewee_id || !rating) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('reviews')
            .insert([{
                reviewer_id: user.id,
                reviewee_id,
                exchange_id,
                rating,
                comment
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating review:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get reviews for a specific user
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const { data, error } = await supabase
            .from('reviews')
            .select('*, reviewer:profiles!reviewer_id(username, full_name)')
            .eq('reviewee_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

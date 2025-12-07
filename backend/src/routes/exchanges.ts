import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Get all exchanges for the authenticated user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('exchanges')
            .select(`
                *,
                proposer:profiles!proposer_id(username, full_name, email),
                receiver:profiles!receiver_id(username, full_name, email),
                skill_offered:skills!skill_id_offered(name),
                skill_requested:skills!skill_id_requested(name)
            `)
            .or(`proposer_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Error fetching exchanges:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Propose a new exchange
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { skill_id_offered, skill_id_requested, receiver_id } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('exchanges')
            .insert([{
                skill_id_offered,
                skill_id_requested,
                proposer_id: user.id,
                receiver_id,
                status: 'pending'
            }])
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Error creating exchange:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) });
    }
});

// Update an exchange (e.g., accept, reject)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if the user is the receiver of the exchange
        const { data: exchange, error: selectError } = await supabase.from('exchanges').select('receiver_id').eq('id', id).single();
        if (selectError) throw selectError;
        if (exchange.receiver_id !== user.id) {
            return res.status(403).json({ error: 'You are not authorized to update this exchange' });
        }

        const { data, error } = await supabase
            .from('exchanges')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

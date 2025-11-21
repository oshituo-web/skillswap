import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { supabase } from '../lib/supabaseClient';

const router = express.Router();

// Get all skills
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase.from('skills').select('*');
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get a single skill by id
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('skills').select('*').eq('id', id).single();
        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new skill
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        const { data, error } = await supabase
            .from('skills')
            .insert([{ name, description, user_id: user.id }])
            .select();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update a skill
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if the user owns the skill
        const { data: skill, error: selectError } = await supabase.from('skills').select('user_id').eq('id', id).single();
        if (selectError) throw selectError;
        if (skill.user_id !== user.id) {
            return res.status(403).json({ error: 'You are not authorized to update this skill' });
        }

        const { data, error } = await supabase
            .from('skills')
            .update({ name, description })
            .eq('id', id);

        if (error) throw error;
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a skill
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No authorization header' });
        const { data: { user } } = await supabase.auth.getUser(authHeader.split(' ')[1]);
        if (!user) return res.status(401).json({ error: 'User not found' });

        // Check if the user owns the skill
        const { data: skill, error: selectError } = await supabase.from('skills').select('user_id').eq('id', id).single();
        if (selectError) throw selectError;
        if (skill.user_id !== user.id) {
            return res.status(403).json({ error: 'You are not authorized to delete this skill' });
        }

        const { data, error } = await supabase.from('skills').delete().eq('id', id);

        if (error) throw error;
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


export default router;

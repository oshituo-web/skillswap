import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminSupabase } from '../lib/supabaseClient';

const router = express.Router();

router.get('/users', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        console.log('Fetching users with adminSupabase...');
        const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();

        console.log('Users fetched:', users ? users.length : 0);
        console.log('Error:', error);

        if (error) {
            throw error;
        }

        res.json(users);
    } catch (error) {
        console.error('Error in /admin/users:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/skills/:id', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { data, error } = await adminSupabase.from('skills').delete().eq('id', id);

        if (error) {
            throw error;
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/exchanges', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { data, error } = await adminSupabase.from('exchanges').select('*');

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/analytics', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { data: users, error: usersError } = await adminSupabase.auth.admin.listUsers();
        if (usersError) throw usersError;

        const { count: skillsCount, error: skillsError } = await adminSupabase.from('skills').select('*', { count: 'exact', head: true });
        if (skillsError) throw skillsError;

        const { count: exchangesCount, error: exchangesError } = await adminSupabase.from('exchanges').select('*', { count: 'exact', head: true });
        if (exchangesError) throw exchangesError;

        res.json({
            users: users.length,
            skills: skillsCount,
            exchanges: exchangesCount
        });

    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.patch('/users/:id/role', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { is_admin } = req.body;

        if (typeof is_admin !== 'boolean') {
            return res.status(400).json({ error: 'is_admin must be a boolean' });
        }

        const { data, error } = await adminSupabase.auth.admin.updateUserById(id, {
            user_metadata: { is_admin }
        });

        if (error) {
            throw error;
        }

        res.json({ success: true, user: data.user });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;

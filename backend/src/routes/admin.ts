import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminSupabase } from '../lib/supabaseClient';

const router = express.Router();

// Get all skills with user emails (admin only)
// Get all skills with user emails (admin only)
router.get('/all-skills', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { data: skills, error: skillsError } = await adminSupabase
            .from('skills')
            .select('*')
            .order('created_at', { ascending: false });

        if (skillsError) throw skillsError;

        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (usersError) throw usersError;

        const userMap = new Map(users.map(u => [u.id, u.email]));

        const enrichedSkills = skills.map(skill => ({
            ...skill,
            user_email: userMap.get(skill.user_id) || 'Unknown User',
        }));

        res.json(enrichedSkills);
    } catch (error) {
        console.error('Error in /admin/all-skills:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/users', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {

        const { data: { users }, error } = await adminSupabase.auth.admin.listUsers();



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

// Get all skills with user emails (admin only)


router.get('/exchanges', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        // Fetch exchanges
        const { data: exchanges, error } = await adminSupabase
            .from('exchanges')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            throw error;
        }



        if (!exchanges || exchanges.length === 0) {

            return res.json([]);
        }

        // Get all users to map IDs to emails (fetch up to 1000 to be safe)
        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (usersError) throw usersError;



        // Get all skills to map IDs to skill names
        const { data: skills, error: skillsError } = await adminSupabase
            .from('skills')
            .select('id, name');

        if (skillsError) throw skillsError;



        const userMap = new Map(users?.map(u => [u.id, u.email]) || []);
        const skillMap = new Map(skills?.map(s => [s.id, s.name]) || []);



        // Enrich exchanges with user emails and skill names
        const enrichedExchanges = exchanges.map(exchange => {
            const proposerEmail = userMap.get(exchange.proposer_id);
            const receiverEmail = userMap.get(exchange.receiver_id);
            const skillRequestedName = skillMap.get(exchange.skill_id_requested);
            const skillOfferedName = skillMap.get(exchange.skill_id_offered);



            return {
                ...exchange,
                proposer_email: proposerEmail || 'Unknown User',
                receiver_email: receiverEmail || 'Unknown User',
                skill_requested_name: skillRequestedName || 'Unknown Skill',
                skill_offered_name: skillOfferedName || 'Unknown Skill',
            };
        });



        res.json(enrichedExchanges);
    } catch (error) {
        console.error('[ERROR EXCHANGES]', error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as any).message });
    }
});

router.get('/analytics', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        // Fetch up to 1000 users for accurate count
        const { data: { users }, error: usersError } = await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
        if (usersError) throw usersError;



        const { count: skillsCount, error: skillsError } = await adminSupabase.from('skills').select('*', { count: 'exact', head: true });
        if (skillsError) throw skillsError;

        const { count: exchangesCount, error: exchangesError } = await adminSupabase.from('exchanges').select('*', { count: 'exact', head: true });
        if (exchangesError) throw exchangesError;

        const analyticsData = {
            users: users?.length || 0,
            skills: skillsCount || 0,
            exchanges: exchangesCount || 0
        };



        res.json(analyticsData);

    } catch (error) {
        console.error('[ERROR ANALYTICS]', error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as any).message });
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

// Exchange action endpoints
router.patch('/exchanges/:id/approve', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { id } = req.params;



        const { data, error } = await adminSupabase
            .from('exchanges')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;


        res.json({ message: 'Exchange approved successfully', exchange: data });
    } catch (error) {
        console.error('[ERROR] Approve exchange:', error);
        res.status(500).json({ error: 'Failed to approve exchange', details: (error as any).message });
    }
});

router.patch('/exchanges/:id/reject', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { id } = req.params;



        const { data, error } = await adminSupabase
            .from('exchanges')
            .update({
                status: 'rejected',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;


        res.json({ message: 'Exchange rejected successfully', exchange: data });
    } catch (error) {
        console.error('[ERROR] Reject exchange:', error);
        res.status(500).json({ error: 'Failed to reject exchange', details: (error as any).message });
    }
});

router.patch('/exchanges/:id/cancel', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { id } = req.params;



        const { data, error } = await adminSupabase
            .from('exchanges')
            .update({
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;


        res.json({ message: 'Exchange cancelled successfully', exchange: data });
    } catch (error) {
        console.error('[ERROR] Cancel exchange:', error);
        res.status(500).json({ error: 'Failed to cancel exchange', details: (error as any).message });
    }
});

export default router;

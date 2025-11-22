import express, { Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { adminSupabase } from '../lib/supabaseClient';

const router = express.Router();

// Get audit logs
router.get('/audit-logs', [authMiddleware, adminMiddleware], async (req: Request, res: Response) => {
    try {
        const { data, error } = await adminSupabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) throw error;

        res.json(data || []);
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create audit log entry
export const createAuditLog = async (adminId: string, action: string, targetId: string, details: any) => {
    try {
        await adminSupabase
            .from('audit_logs')
            .insert({
                admin_id: adminId,
                action,
                target_id: targetId,
                details: JSON.stringify(details),
                created_at: new Date().toISOString()
            });
    } catch (error) {
        console.error('Error creating audit log:', error);
    }
};

export default router;

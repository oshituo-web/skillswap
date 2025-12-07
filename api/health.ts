import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSupabaseUrl: !!process.env.SUPABASE_URL,
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY
    });
}

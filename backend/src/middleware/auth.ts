import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabaseClient';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  console.log('Auth Middleware - Token:', token ? 'Present' : 'Missing');

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    console.log('Auth Middleware - User from token:', user ? user.email : 'null');
    console.log('Auth Middleware - User metadata:', JSON.stringify(user?.user_metadata, null, 2));
    console.log('Auth Middleware - Error:', error);

    if (error || !user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware - Exception:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

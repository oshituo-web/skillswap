import { Request, Response, NextFunction } from 'express';

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;

  console.log('Admin Middleware - User:', JSON.stringify(user, null, 2));
  console.log('Is Admin?', user?.user_metadata?.is_admin);

  if (!user || !user.user_metadata || !user.user_metadata.is_admin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

import type { Response, Request, NextFunction } from 'express';
import type { AuthedRequest } from '../types/type.js';

export function requireRole(role: 'dispatcher' | 'technician') {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    if (req.user.role !== role) {
      return res.status(403).json({ error: `This action requires the ${role} role` });
    }
    next();
  };
}   
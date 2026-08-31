import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AuthedRequest, Payload } from '../types/type.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

export function authMiddleware(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }

  const token = header.split(' ')[1];
  if(!token)  return res.status(403).json({ error: 'Missing Auth token' });

  try {
    const payload  = jwt.verify(token, JWT_SECRET) as Payload
    req.user = payload;  
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
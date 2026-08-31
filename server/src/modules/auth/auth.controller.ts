import type { Request, Response } from 'express';
import { login } from './auth.service.js';

export default async function loginController(req: Request, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  try {
    const result = await login(email, password);
    return res.status(200).json(result);
  } catch (err) {
    return res.status(401).json({ error: (err as Error).message });
  }
}
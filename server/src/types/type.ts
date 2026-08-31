import type { Request } from "express";

export interface AuthedRequest extends Request {
  user?: { userId: string; role: 'dispatcher' | 'technician' };
}

export interface Payload {
  userId: string;
  role: 'dispatcher' | 'technician';
}
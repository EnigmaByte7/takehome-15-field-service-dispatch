import { prisma } from '../../db/client.js';
import { Role } from '../../generated/prisma/enums.js';

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export function createUser(data: { email: string; passwordHash: string; role: Role }) {
  return prisma.user.create({ data });
}
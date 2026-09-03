import { prisma } from '../../db/client.js';

export function listTechnicians() {
  return prisma.user.findMany({
    where: { role: 'technician' },
    select: { id: true, email: true },
    orderBy: { email: 'asc' },
  });
}
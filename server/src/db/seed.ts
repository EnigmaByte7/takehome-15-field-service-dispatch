import { PrismaClient } from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';

import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const db = new PrismaClient({ adapter });

async function main() {
  const password = await bcrypt.hash('password123', 10);

  await db.user.upsert({
    where: { email: 'dispatcher@demo.com' },
    update: {},
    create: {
      email: 'dispatcher@demo.com',
      passwordHash: password,
      role: 'dispatcher',
    },
  });

  await db.user.upsert({
    where: { email: 'priya@demo.com' },
    update: {},
    create: {
      email: 'priya@demo.com',
      passwordHash: password,
      role: 'technician',
    },
  });

  await db.user.upsert({
    where: { email: 'sam@demo.com' },
    update: {},
    create: {
      email: 'sam@demo.com',
      passwordHash: password,
      role: 'technician',
    },
  });

  console.log('Seeded users. All passwords: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
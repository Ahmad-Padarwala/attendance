import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✓ Admin user created:', admin.email);

  // Create a sample staff user (optional)
  const staffPassword = await hashPassword('staff123');
  
  const staff = await prisma.user.upsert({
    where: { email: 'staff@example.com' },
    update: {},
    create: {
      email: 'staff@example.com',
      password: staffPassword,
      role: 'STAFF',
      staffProfile: {
        create: {
          fullName: 'John Doe',
          salary: 50000,
          workingDays: JSON.stringify(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']),
          officeTimeIn: '09:00',
          officeTimeOut: '18:00',
        },
      },
    },
  });

  console.log('✓ Sample staff user created:', staff.email);
  console.log('\nDefault credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Staff: staff@example.com / staff123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


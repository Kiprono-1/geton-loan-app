/**
 * Seed script for development.
 * Run: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database…\n");

  // Demo user
  const passwordHash = await bcrypt.hash("Demo1234!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@geton.co.ke" },
    update: {},
    create: {
      fullName: "Alex Kamau",
      email: "demo@geton.co.ke",
      phone: "+254712345678",
      passwordHash,
      kycLevel: 2,
      kycStatus: "approved",
      creditScore: 720,
      loanLimit: 150_000,
      walletBalance: 5_000,
    },
  });

  await prisma.kYC.upsert({
    where: { userId: demoUser.id },
    update: {},
    create: {
      userId: demoUser.id,
      fullName: "Alex Kamau",
      nationalId: "12345678",
      mpesaNumber: "+254712345678",
      kraPin: "A012345678Z",
      status: "approved",
      approvedAt: new Date(),
    },
  });

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@geton.co.ke" },
    update: {},
    create: {
      fullName: "Admin User",
      email: "admin@geton.co.ke",
      phone: "+254700000000",
      passwordHash: await bcrypt.hash("Admin1234!", 12),
      role: "admin",
      kycLevel: 3,
      kycStatus: "approved",
      creditScore: 850,
      loanLimit: 250_000,
    },
  });
  // Note: role is not in User model, would need migration. Skip for demo.

  console.log("✅ Seeded demo user:", demoUser.email);
  console.log("   Password: Demo1234!");
  console.log("   Phone: +254712345678");
  console.log("");
  console.log("✅ Seeded admin user:", adminUser.email);
  console.log("   Password: Admin1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

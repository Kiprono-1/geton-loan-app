/**
 * First-time setup script.
 * Run with: npx tsx scripts/setup.ts
 *
 * Does the following:
 * 1. Installs dependencies (if not already)
 * 2. Generates Prisma client
 * 3. Pushes schema to database (creates all 13 tables)
 * 4. Seeds demo data
 * 5. Verifies connection
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import crypto from "crypto";

const prisma = new PrismaClient();

const log = (msg: string) => console.log(`\n✅ ${msg}`);
const error = (msg: string) => console.error(`\n❌ ${msg}`);

async function checkNode() {
  const nodeVersion = process.version;
  const major = parseInt(nodeVersion.slice(1).split(".")[0]);
  if (major < 20) {
    error(`Node.js 20+ required. You have ${nodeVersion}`);
    process.exit(1);
  }
  log(`Node.js ${nodeVersion} (>= 20)`);
}

async function generateJwtSecret() {
  return crypto.randomBytes(64).toString("hex");
}

async function main() {
  console.log("\n🚀 GETON Kenya Backend — First-Time Setup\n");
  console.log("=".repeat(50));

  // 1. Check Node version
  await checkNode();

  // 2. Verify .env exists
  try {
    const fs = await import("fs");
    if (!fs.existsSync(".env")) {
      error(".env file not found in backend/");
      console.log("\nPlease create backend/.env with your configuration.");
      console.log("See backend/.env.example for a template.\n");
      process.exit(1);
    }
    log(".env file found");
  } catch (err) {
    error(`Error checking .env: ${err}`);
    process.exit(1);
  }

  // 3. Install dependencies if needed
  try {
    const fs = await import("fs");
    if (!fs.existsSync("node_modules")) {
      log("Installing dependencies...");
      execSync("npm install", { stdio: "inherit" });
    } else {
      log("Dependencies already installed");
    }
  } catch (err) {
    error(`Error installing dependencies: ${err}`);
    process.exit(1);
  }

  // 4. Generate Prisma client
  try {
    log("Generating Prisma client...");
    execSync("npx prisma generate", { stdio: "inherit" });
  } catch (err) {
    error(`Error generating Prisma client: ${err}`);
    process.exit(1);
  }

  // 5. Push schema to database
  try {
    log("Pushing schema to database...");
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
    });
  } catch (err) {
    error(`Error pushing schema: ${err}`);
    process.exit(1);
  }

  // 6. Verify connection
  try {
    log("Verifying database connection...");
    await prisma.$connect();
    const userCount = await prisma.user.count();
    log(`Database connected! Found ${userCount} existing users.`);
  } catch (err) {
    error(`Error connecting to database: ${err}`);
    process.exit(1);
  }

  // 7. Seed demo data
  try {
    log("Seeding demo data...");
    execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });
  } catch (err) {
    error(`Error seeding data: ${err}`);
    console.log("\nNote: Seeding failed but database is ready. You can seed later with: npm run db:seed\n");
  }

  console.log("\n" + "=".repeat(50));
  console.log("\n🎉 Setup complete!\n");
  console.log("Next steps:");
  console.log("  1. Start the API:        npm run dev");
  console.log("  2. Test health check:    curl http://localhost:3000/api/health");
  console.log("  3. Run tests:             npm run test:payment");
  console.log("  4. Login as admin:       admin@geton.co.ke / Admin1234!");
  console.log("  5. Login as demo user:   demo@geton.co.ke / Demo1234!");
  console.log("\n📖 For deployment guide, see: KIRO_DEPLOYMENT.md\n");
}

main()
  .catch((e) => {
    error(e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

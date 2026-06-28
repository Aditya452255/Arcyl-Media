const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seeding started...");

  // Define default Super Admin credentials
  const email = "superadmin@arcylmedia.com";
  const name = "System Super Admin";
  const defaultPassword = "SuperAdminSecurePassword2026!";

  // Check if Super Admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    console.log("Creating default Super Admin user...");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    const superAdmin = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "SUPER_ADMIN",
      },
    });

    console.log(`✅ Super Admin created: ${superAdmin.email}`);
    console.log(`🔑 Default Password: ${defaultPassword}`);
    console.log(`⚠️  Please change this password immediately in production!`);
  } else {
    console.log("ℹ️  Super Admin user already exists. Skipping creation.");
  }

  console.log("🌱 Database seeding completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

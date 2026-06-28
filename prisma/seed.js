const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Database seeding started...");

  // 1. Define permissions list
  const permissionsList = [
    { name: "Lead.Read", description: "View captured leads" },
    { name: "Lead.Update", description: "Modify lead status or details" },
    { name: "Lead.Delete", description: "Delete leads" },
    { name: "CMS.Create", description: "Create CMS items" },
    { name: "CMS.Update", description: "Update CMS items" },
    { name: "CMS.Delete", description: "Soft delete CMS items" },
    { name: "Media.Upload", description: "Upload media to library" },
    { name: "Media.Delete", description: "Delete media from library" },
    { name: "Settings.Update", description: "Modify website setting nodes" },
    { name: "Dashboard.Read", description: "Access dashboard statistics" },
  ];

  console.log("Seeding permissions...");
  const dbPermissions = {};
  for (const perm of permissionsList) {
    dbPermissions[perm.name] = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });
  }

  // 2. Define roles list
  const rolesList = [
    { name: "SUPER_ADMIN", description: "Root system administrator" },
    { name: "ADMIN", description: "Standard agency administrator" },
    { name: "MANAGER", description: "Agency supervisor" },
    { name: "SALES", description: "Lead acquisition agent" },
    { name: "DEVELOPER", description: "Development engineer" },
    { name: "DESIGNER", description: "Creative designer" },
    { name: "CLIENT", description: "External client representative" },
  ];

  console.log("Seeding roles...");
  const dbRoles = {};
  for (const role of rolesList) {
    dbRoles[role.name] = await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  // 3. Map permissions to roles
  const rolePermissionsMap = {
    SUPER_ADMIN: Object.keys(dbPermissions),
    ADMIN: Object.keys(dbPermissions),
    MANAGER: ["Lead.Read", "Lead.Update", "CMS.Create", "CMS.Update", "Media.Upload", "Dashboard.Read"],
    SALES: ["Lead.Read", "Lead.Update", "Dashboard.Read"],
    DEVELOPER: ["CMS.Create", "CMS.Update", "Media.Upload"],
    DESIGNER: ["CMS.Create", "CMS.Update", "Media.Upload"],
    CLIENT: ["Dashboard.Read"],
  };

  console.log("Seeding role-permission linkages...");
  for (const [roleName, permissions] of Object.entries(rolePermissionsMap)) {
    const roleId = dbRoles[roleName].id;
    for (const permName of permissions) {
      const permissionId = dbPermissions[permName].id;
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId, permissionId },
        },
        update: {},
        create: { roleId, permissionId },
      });
    }
  }

  // 4. Seed default Super Admin user (as requested)
  const adminEmail = "arcylmedia@gmail.com";
  const adminName = "Arcyl Media Super Admin";
  const defaultPassword = "arcylic@canvasmedia";

  console.log("Checking default Super Admin user...");
  let superAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!superAdmin) {
    console.log("Creating default Super Admin user...");
    const passwordHash = await bcrypt.hash(defaultPassword, 10);
    superAdmin = await prisma.user.create({
      data: {
        name: adminName,
        email: adminEmail,
        passwordHash,
      },
    });
    console.log(`✅ Default Super Admin created: ${superAdmin.email}`);
  } else {
    console.log("ℹ️  Default Super Admin already exists.");
  }

  // 5. Link Super Admin user to SUPER_ADMIN role
  const superAdminRoleId = dbRoles.SUPER_ADMIN.id;
  await prisma.userRole.upsert({
    where: {
      userId_roleId: { userId: superAdmin.id, roleId: superAdminRoleId },
    },
    update: {},
    create: {
      userId: superAdmin.id,
      roleId: superAdminRoleId,
    },
  });
  console.log("✅ Super Admin role mapping completed.");

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

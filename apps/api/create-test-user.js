const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash("admin123456", 10);

    // Criar admin na tabela Admin
    const admin = await prisma.admin.create({
      data: {
        email: "admin@quezi.com",
        passwordHash: hashedPassword,
        name: "Administrador Quezi",
        role: "SUPER_ADMIN",
        permissions: {
          users: { create: true, read: true, update: true, delete: true },
          services: { create: true, read: true, update: true, delete: true },
          appointments: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
          reviews: { create: true, read: true, update: true, delete: true },
          organizations: {
            create: true,
            read: true,
            update: true,
            delete: true,
          },
        },
        isActive: true,
      },
    });

    console.log("✅ Admin criado:", {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isActive: admin.isActive,
    });

    console.log("🔐 Email: admin@quezi.com");
    console.log("🔐 Senha: admin123456");
  } catch (error) {
    if (error.code === "P2002") {
      console.log("ℹ️  Usuário já existe");
    } else {
      console.error("❌ Erro ao criar usuário:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash da senha
    const hashedPassword = await bcrypt.hash("12345678", 10);

    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: "teste@teste.com",
        passwordHash: hashedPassword,
        name: "Usuário Teste",
        userType: "CLIENT",
        isEmailVerified: true,
      },
    });

    console.log("✅ Usuário de teste criado:", {
      id: user.id,
      email: user.email,
      name: user.name,
    });

    console.log("🔐 Senha: 12345678");
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

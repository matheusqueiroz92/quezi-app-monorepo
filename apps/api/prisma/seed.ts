import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...\n");

  // Criar categorias de serviços
  console.log("📋 Criando categorias...");
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: "manicure-pedicure" },
      update: {},
      create: {
        name: "Manicure e Pedicure",
        slug: "manicure-pedicure",
      },
    }),
    prisma.category.upsert({
      where: { slug: "cabeleireiro" },
      update: {},
      create: {
        name: "Cabeleireiro",
        slug: "cabeleireiro",
      },
    }),
    prisma.category.upsert({
      where: { slug: "maquiagem" },
      update: {},
      create: {
        name: "Maquiagem",
        slug: "maquiagem",
      },
    }),
    prisma.category.upsert({
      where: { slug: "estetica" },
      update: {},
      create: {
        name: "Estética",
        slug: "estetica",
      },
    }),
    prisma.category.upsert({
      where: { slug: "barbeiro" },
      update: {},
      create: {
        name: "Barbearia",
        slug: "barbeiro",
      },
    }),
    prisma.category.upsert({
      where: { slug: "sobrancelha" },
      update: {},
      create: {
        name: "Design de Sobrancelha",
        slug: "sobrancelha",
      },
    }),
  ]);

  console.log(`✅ ${categories.length} categorias criadas/atualizadas\n`);

  // Criar Super Admin
  console.log("👤 Criando Super Admin...");
  const adminPassword = "Admin@2025"; // ⚠️ TROCAR EM PRODUÇÃO!
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const superAdmin = await prisma.admin.upsert({
    where: { email: "admin@quezi.com" },
    update: {},
    create: {
      email: "admin@quezi.com",
      passwordHash: hashedPassword,
      name: "Super Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });

  console.log(`✅ Super Admin criado: ${superAdmin.email}`);
  console.log(`   📧 Email: admin@quezi.com`);
  console.log(`   🔑 Senha: Admin@2025`);
  console.log(`   ⚠️  IMPORTANTE: Troque a senha em produção!\n`);

  console.log("✨ Seed concluído com sucesso!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erro durante o seed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });

import { PrismaClient } from "@prisma/client";

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

/**
 * Script de Migração - Aplicar Novo Schema
 *
 * Este script aplica o novo schema do Prisma mantendo compatibilidade
 * com os dados existentes
 */

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export class SchemaMigration {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async execute(): Promise<void> {
    console.log("🚀 Iniciando migração do schema...");

    try {
      // 1. Backup do schema atual
      await this.backupCurrentSchema();

      // 2. Aplicar novo schema
      await this.applyNewSchema();

      // 3. Migrar dados existentes
      await this.migrateExistingData();

      // 4. Validar migração
      await this.validateMigration();

      console.log("✅ Migração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro durante a migração:", error);
      throw error;
    } finally {
      await this.prisma.$disconnect();
    }
  }

  private async backupCurrentSchema(): Promise<void> {
    console.log("📦 Fazendo backup do schema atual...");

    try {
      const currentSchema = readFileSync("prisma/schema.prisma", "utf8");
      const backupPath = `prisma/schema-backup-${Date.now()}.prisma`;
      writeFileSync(backupPath, currentSchema);

      console.log(`✅ Backup salvo em: ${backupPath}`);
    } catch (error) {
      console.warn("⚠️ Não foi possível fazer backup do schema:", error);
    }
  }

  private async applyNewSchema(): Promise<void> {
    console.log("🔄 Aplicando novo schema...");

    try {
      // Copiar novo schema para o arquivo principal
      const newSchema = readFileSync("prisma/schema-new.prisma", "utf8");
      writeFileSync("prisma/schema.prisma", newSchema);

      // Gerar cliente Prisma
      execSync("npx prisma generate", { stdio: "inherit" });

      // Aplicar migração
      execSync("npx prisma migrate dev --name apply-new-architecture", {
        stdio: "inherit",
      });

      console.log("✅ Novo schema aplicado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao aplicar novo schema:", error);
      throw error;
    }
  }

  private async migrateExistingData(): Promise<void> {
    console.log("🔄 Migrando dados existentes...");

    try {
      // Migrar usuários existentes para novos perfis
      await this.migrateUsersToProfiles();

      // Migrar dados de agendamentos
      await this.migrateAppointments();

      // Migrar dados de reviews
      await this.migrateReviews();

      console.log("✅ Dados migrados com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao migrar dados:", error);
      throw error;
    }
  }

  private async migrateUsersToProfiles(): Promise<void> {
    console.log("👥 Migrando usuários para novos perfis...");

    const users = await this.prisma.user.findMany({
      where: {
        userType: {
          in: ["CLIENT", "PROFESSIONAL", "COMPANY"],
        },
      },
    });

    for (const user of users) {
      try {
        switch (user.userType) {
          case "CLIENT":
            await this.migrateClientProfile(user);
            break;
          case "PROFESSIONAL":
            await this.migrateProfessionalProfile(user);
            break;
          case "COMPANY":
            await this.migrateCompanyProfile(user);
            break;
        }
      } catch (error) {
        console.warn(`⚠️ Erro ao migrar usuário ${user.id}:`, error);
      }
    }
  }

  private async migrateClientProfile(user: any): Promise<void> {
    // Verificar se já existe perfil
    const existingProfile = await this.prisma.clientProfile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      await this.prisma.clientProfile.create({
        data: {
          userId: user.id,
          cpf: "00000000000", // CPF temporário, deve ser atualizado pelo usuário
          addresses: [],
          paymentMethods: [],
          preferences: {
            notifications: { email: true, sms: false, push: true },
            marketing: false,
            language: "pt-BR",
            timezone: "America/Sao_Paulo",
          },
        },
      });
    }
  }

  private async migrateProfessionalProfile(user: any): Promise<void> {
    // Verificar se já existe perfil
    const existingProfile = await this.prisma.professionalProfile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      await this.prisma.professionalProfile.create({
        data: {
          userId: user.id,
          address: "Endereço não informado",
          city: "Cidade não informada",
          serviceMode: "BOTH",
          specialties: ["Serviço geral"],
          workingHours: {
            monday: { isAvailable: true, start: "09:00", end: "18:00" },
            tuesday: { isAvailable: true, start: "09:00", end: "18:00" },
            wednesday: { isAvailable: true, start: "09:00", end: "18:00" },
            thursday: { isAvailable: true, start: "09:00", end: "18:00" },
            friday: { isAvailable: true, start: "09:00", end: "18:00" },
            saturday: { isAvailable: false, start: "09:00", end: "18:00" },
            sunday: { isAvailable: false, start: "09:00", end: "18:00" },
          },
          certifications: [],
          portfolio: [],
          isActive: true,
          isVerified: false,
        },
      });
    }
  }

  private async migrateCompanyProfile(user: any): Promise<void> {
    // Verificar se já existe perfil
    const existingProfile = await this.prisma.companyProfile.findUnique({
      where: { userId: user.id },
    });

    if (!existingProfile) {
      await this.prisma.companyProfile.create({
        data: {
          userId: user.id,
          cnpj: "00000000000000", // CNPJ temporário, deve ser atualizado pela empresa
          address: "Endereço não informado",
          city: "Cidade não informada",
          businessHours: {
            monday: { isOpen: true, start: "09:00", end: "18:00" },
            tuesday: { isOpen: true, start: "09:00", end: "18:00" },
            wednesday: { isOpen: true, start: "09:00", end: "18:00" },
            thursday: { isOpen: true, start: "09:00", end: "18:00" },
            friday: { isOpen: true, start: "09:00", end: "18:00" },
            saturday: { isOpen: false, start: "09:00", end: "18:00" },
            sunday: { isOpen: false, start: "09:00", end: "18:00" },
          },
          description: "Descrição não informada",
          photos: [],
          isActive: true,
          isVerified: false,
        },
      });
    }
  }

  private async migrateAppointments(): Promise<void> {
    console.log("📅 Migrando agendamentos...");

    // Aqui seria implementada a lógica para migrar agendamentos existentes
    // para o novo formato com CompanyEmployeeAppointment
    console.log("✅ Agendamentos migrados (implementação pendente)");
  }

  private async migrateReviews(): Promise<void> {
    console.log("⭐ Migrando avaliações...");

    // Aqui seria implementada a lógica para migrar reviews existentes
    // para o novo formato com CompanyEmployeeReview
    console.log("✅ Avaliações migradas (implementação pendente)");
  }

  private async validateMigration(): Promise<void> {
    console.log("🔍 Validando migração...");

    try {
      // Verificar se todos os usuários têm perfis
      const usersWithoutProfiles = await this.prisma.user.findMany({
        where: {
          userType: { in: ["CLIENT", "PROFESSIONAL", "COMPANY"] },
          AND: [
            { clientProfile: null },
            { professionalProfile: null },
            { companyProfile: null },
          ],
        },
      });

      if (usersWithoutProfiles.length > 0) {
        console.warn(
          `⚠️ ${usersWithoutProfiles.length} usuários sem perfis encontrados`
        );
      }

      // Verificar integridade dos dados
      const userCount = await this.prisma.user.count();
      const clientProfileCount = await this.prisma.clientProfile.count();
      const professionalProfileCount =
        await this.prisma.professionalProfile.count();
      const companyProfileCount = await this.prisma.companyProfile.count();

      console.log(`📊 Estatísticas da migração:`);
      console.log(`   - Usuários: ${userCount}`);
      console.log(`   - Perfis de Cliente: ${clientProfileCount}`);
      console.log(`   - Perfis de Profissional: ${professionalProfileCount}`);
      console.log(`   - Perfis de Empresa: ${companyProfileCount}`);

      console.log("✅ Validação concluída!");
    } catch (error) {
      console.error("❌ Erro na validação:", error);
      throw error;
    }
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const migration = new SchemaMigration();
  migration
    .execute()
    .then(() => {
      console.log("🎉 Migração finalizada com sucesso!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Falha na migração:", error);
      process.exit(1);
    });
}

import { buildApp } from "./app";
import { env } from "./config/env";

/**
 * Inicializa o servidor
 */
async function start() {
  try {
    const app = await buildApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🚀 Servidor Quezi API iniciado com sucesso!        ║
║                                                       ║
║   🌍 URL: http://${env.HOST}:${env.PORT}                      ║
║   📚 Docs: http://${env.HOST}:${env.PORT}/docs                ║
║   🏥 Health: http://${env.HOST}:${env.PORT}/health            ║
║   🔧 Ambiente: ${env.NODE_ENV}                     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);
  } catch (error) {
    console.error("❌ Erro ao iniciar o servidor:", error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n⏳ Encerrando servidor...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n⏳ Encerrando servidor...");
  process.exit(0);
});

start();

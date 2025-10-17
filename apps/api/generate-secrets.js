#!/usr/bin/env node

/**
 * Script para gerar credenciais do Better Auth
 * 
 * Uso:
 *   node generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Gerando credenciais do Better Auth...\n');
console.log('='.repeat(60));

// Gerar BETTER_AUTH_SECRET
const betterAuthSecret = crypto.randomBytes(32).toString('base64');
console.log('\n✨ BETTER_AUTH_SECRET:');
console.log(betterAuthSecret);

// Gerar JWT_SECRET
const jwtSecret = crypto.randomBytes(32).toString('base64');
console.log('\n✨ JWT_SECRET:');
console.log(jwtSecret);

console.log('\n' + '='.repeat(60));
console.log('\n📝 Copie estas chaves para seu arquivo .env:');
console.log('\n---\n');
console.log(`BETTER_AUTH_SECRET="${betterAuthSecret}"`);
console.log(`JWT_SECRET="${jwtSecret}"`);
console.log(`BETTER_AUTH_URL="http://localhost:3333"`);
console.log('\n---\n');

console.log('⚠️  ATENÇÃO:');
console.log('   - NUNCA commite essas chaves no Git!');
console.log('   - Use chaves DIFERENTES em dev e produção!');
console.log('   - Guarde essas chaves em local seguro!\n');

console.log('✅ Credenciais geradas com sucesso!\n');


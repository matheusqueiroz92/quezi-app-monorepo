import bcrypt from "bcryptjs";

/**
 * Utilitários para hash e verificação de senhas usando BCrypt
 */

const SALT_ROUNDS = 10;

/**
 * Gera hash de senha usando BCrypt
 * @param password - Senha em texto plano
 * @returns Hash da senha
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.trim().length === 0) {
    throw new Error("Senha não pode estar vazia");
  }

  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verifica se senha corresponde ao hash
 * @param password - Senha em texto plano
 * @param hash - Hash para comparar
 * @returns true se senha corresponde ao hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    // Hash inválido ou erro de comparação
    return false;
  }
}

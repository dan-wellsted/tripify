import bcrypt from "bcryptjs";

let cachedArgon: typeof import("argon2") | null = null;

async function loadArgon2() {
  if (cachedArgon) {
    return cachedArgon;
  }

  try {
    cachedArgon = await import("argon2");
    return cachedArgon;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const argon2 = await loadArgon2();
  if (argon2) {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  const argon2 = await loadArgon2();
  if (argon2 && passwordHash.startsWith("$argon2")) {
    return argon2.verify(passwordHash, password);
  }

  return bcrypt.compare(password, passwordHash);
}

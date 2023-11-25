// A singleton function iife that handles password hashing and verification

import bcrypt from "bcryptjs";

let passwordManager: ReturnType<typeof PasswordManager>;

function PasswordManager() {
  const saltRounds = 10;

  async function hashPassword(password: string) {
    const salt = await generateSalt();
    return bcrypt.hash(password, salt);
  }

  async function generateSalt() {
    return bcrypt.genSalt(saltRounds);
  }

  async function verifyPassword(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  return { hashPassword, verifyPassword };
}

export function getPasswordManager() {
  if (!passwordManager) {
    passwordManager = PasswordManager();
  }
  return passwordManager;
}

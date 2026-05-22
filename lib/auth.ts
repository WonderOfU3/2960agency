import bcrypt from 'bcryptjs'
import { customAlphabet } from 'nanoid'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 6 characters, uppercase letters + digits only (no special chars)
// ~2 billion combinations — more than enough for ambassador codes
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

export function generateAmbassadorCode(): string {
  return generateCode()
}

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-cbc';
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

// Initialize encryption key if not loaded
if (!ENCRYPTION_KEY) {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/^ENCRYPTION_KEY=(.+)$/m);
    if (match) {
      ENCRYPTION_KEY = match[1].trim();
    }
  }

  // Generate and save a secure key if not found
  if (!ENCRYPTION_KEY) {
    ENCRYPTION_KEY = crypto.randomBytes(32).toString('hex');
    try {
      fs.appendFileSync(envPath, `\nENCRYPTION_KEY=${ENCRYPTION_KEY}\n`);
      console.log('≡ƒöæ Generated new ENCRYPTION_KEY and saved it to .env.local');
    } catch (err) {
      console.error('Failed to append ENCRYPTION_KEY to .env.local:', err);
    }
  }
  process.env.ENCRYPTION_KEY = ENCRYPTION_KEY;
}

// Convert ENCRYPTION_KEY to a 32-byte buffer
function getKeyBuffer(): Buffer {
  const key = process.env.ENCRYPTION_KEY || ENCRYPTION_KEY;
  if (!key) {
    throw new Error('Encryption key is not initialized.');
  }
  if (key.length === 64 && /^[0-9a-fA-F]+$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  return Buffer.alloc(32, key, 'utf8');
}

/**
 * Encrypt plain text using AES-256-CBC
 * @param {string} text
 * @returns {string} iv:encryptedText
 */
export function encrypt(text: string): string {
  if (!text) return '';
  try {
    const key = getKeyBuffer();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (err) {
    console.error('Encryption failed:', err);
    throw new Error('Failed to encrypt sensitive data.');
  }
}

/**
 * Decrypt cipher text using AES-256-CBC
 * @param {string} encryptedText iv:encryptedText
 * @returns {string} plainText
 */
export function decrypt(encryptedText: string): string {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  try {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts.shift()!, 'hex');
    const encrypted = Buffer.from(parts.join(':'), 'hex');
    const key = getKeyBuffer();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    const decryptedBuf = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decryptedBuf.toString('utf8');
  } catch (err) {
    // If decryption fails, return original text for backwards compatibility
    console.warn('Decryption failed, returning raw string:', (err as Error).message);
    return encryptedText;
  }
}


/**
 * Create a SHA-256 hash of a string
 * @param {string} text
 * @returns {string} sha256Hash
 */
export function hashValue(text: string): string {
  if (!text) return '';
  return crypto.createHash('sha256').update(text.trim()).digest('hex');
}


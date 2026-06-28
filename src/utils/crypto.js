import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
// settings encryption key from environment, fallback to a fallback default
const ENCRYPTION_KEY =
  process.env.SETTINGS_ENCRYPTION_KEY || "d6F3E1A0x291B7bC4D9F0A1b2c3d4e5f"; // 32 bytes key
const IV_LENGTH = 16;

/**
 * Encrypts cleartext using AES-256-CBC
 */
export function encrypt(text) {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Decrypts scrambled text back to cleartext
 */
export function decrypt(text) {
  if (!text) return "";
  try {
    const parts = text.split(":");
    if (parts.length < 2) return text; // Return plain text if not formatted correctly
    const iv = Buffer.from(parts.shift(), "hex");
    const encryptedText = Buffer.from(parts.join(":"), "hex");
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (err) {
    // If decryption fails, return original text to handle old unencrypted entries gracefully
    return text;
  }
}

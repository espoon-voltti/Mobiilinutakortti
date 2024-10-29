import * as crypto from 'crypto';

export const obfuscate = (s: string): string => {
  return s
    .split(' ')
    .map((item) => {
      const first = item.slice(0, 1);
      const rest = item.slice(1).replace(/./g, '.');
      return first + rest;
    })
    .join(' ');
};

export function encrypt(secretKey, data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    iv,
  );
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(secretKey, text) {
  const [iv, encryptedText] = text.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(secretKey),
    Buffer.from(iv, 'hex'),
  );
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
}

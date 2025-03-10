export function xorEncrypt(str, key) {
  return str.split('').map(char => String.fromCharCode(char.charCodeAt(0) ^ key)).join('');
}

export function xorDecrypt(encryptedStr, key) {
  return xorEncrypt(encryptedStr, key); // XOR 计算是可逆的
}
export async function encryptAES(text, key) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key.padEnd(16, " ")), // 补齐 16 字节
    { name: "AES-GCM" },
    false,
    ["encrypt"]
  );
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 随机 IV
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    data
  );
  return btoa(String.fromCharCode(...iv, ...new Uint8Array(encrypted))); // Base64 编码
}

export async function decryptAES(encryptedText, key) {
  const binary = atob(encryptedText).split("").map(c => c.charCodeAt(0));
  const iv = new Uint8Array(binary.slice(0, 12)); // 取出 IV
  const data = new Uint8Array(binary.slice(12));
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key.padEnd(16, " ")),
    { name: "AES-GCM" },
    false,
    ["decrypt"]
  );
  const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, cryptoKey, data);
  return new TextDecoder().decode(decrypted);
}
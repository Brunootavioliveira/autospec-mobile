import CryptoJS from 'crypto-js';

const HMAC_SECRET = import.meta.env.VITE_HMAC_SECRET;
console.log('HMAC_SECRET:', HMAC_SECRET); 
export function buildHmacHeaders(body) {
  const timestamp = Date.now().toString();
  const normalized = JSON.stringify(body);
  const signature = CryptoJS.HmacSHA256(normalized + timestamp, HMAC_SECRET).toString();
  return {
    'X-Signature': signature,
    'X-Timestamp': timestamp,
  };
}
import crypto from "crypto";

function base32Encode(buffer: Buffer) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  let result = "";
  let bits = 0;
  let bitsCount = 0;

  for (let i = 0; i < buffer.length; i++) {
    let char = buffer[i];
    bits += char;
    bitsCount += 8;
    while (bitsCount >= 5) {
      result += alphabet[(bits >> (bitsCount - 5)) & 31];
      bitsCount -= 5;
    }
    bits <<= 8;
  }
  if (bitsCount > 0) {
    result += alphabet[(bits << (5 - bitsCount)) & 31];
  }

  return result;
}

export function generateBase32Secret(length = 10) {
  const randomBytes = crypto.randomBytes(length);
  return base32Encode(randomBytes);
}

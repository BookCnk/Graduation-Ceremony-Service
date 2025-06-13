import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret: string = process.env.JWT_SECRET ?? "default_secret";

// 🔧 ใช้ Type Guard เพื่อแน่ใจว่า expiresIn ถูกต้อง
const getExpiresIn = (): SignOptions["expiresIn"] => {
  const value = process.env.JWT_EXPIRES_IN ?? "1h";

  // ถ้าเป็นเลข → แปลงเป็น number
  const num = Number(value);
  if (!isNaN(num)) return num;

  // ถ้าไม่ใช่ number → return เป็น string ได้
  return value as SignOptions["expiresIn"];
};

  export const generateToken = (
    payload: object,
    expiresIn: SignOptions["expiresIn"] = getExpiresIn()
  ): string => {
    return jwt.sign(payload, secret, { expiresIn });
  };

  export const verifyToken = (token: string) => {
    return jwt.verify(token, secret);
  };

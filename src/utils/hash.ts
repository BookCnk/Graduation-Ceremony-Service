import bcrypt from "bcryptjs";

export const hashPassword = async (plain: string) =>
  await bcrypt.hash(plain, 10);

export const comparePassword = async (plain: string, hashed: string) =>
  await bcrypt.compare(plain, hashed);

import { db } from "@/config/db";
import { hashPassword, comparePassword } from "@/utils/hash";

export const findUserByName = async (name: string) => {
  const [rows]: any = await db.query("SELECT * FROM users WHERE name = ?", [
    name,
  ]);
  return rows[0];
};

export const createUser = async (name: string, password: string) => {
  const hashed = await hashPassword(password);
  await db.query("INSERT INTO users (name, password) VALUES (?, ?)", [
    name,
    hashed,
  ]);
};

export const verifyUser = async (name: string, password: string) => {
  console.log("🔥 /auth/verifyUser called");
  const user = await findUserByName(name);
  if (!user) return null;
  const isMatch = await comparePassword(password, user.password);
  return isMatch ? user : null;
};

export const getAllUsers = async () => {
  const [rows]: any = await db.query("SELECT id, name, created_at FROM users");
  console.log("🔥 /auth/users called");

  return rows;
};

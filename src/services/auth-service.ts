import { db } from "@/config/db";
import { hashPassword, comparePassword } from "@/utils/hash";
import { formatToDateTimeICT } from "@/utils/date";

export const findUserByName = async (name: string) => {
  const [rows]: any = await db.query("SELECT * FROM users WHERE name = ?", [
    name,
  ]);
  return rows[0];
};

export const createUser = async (
  name: string,
  password: string
): Promise<boolean> => {
  const [rows]: any = await db.query("SELECT id FROM users WHERE name = ?", [
    name,
  ]);
  if (rows.length > 0) return false;

  const hashed = await hashPassword(password);
  await db.query("INSERT INTO users (name, password) VALUES (?, ?)", [
    name,
    hashed,
  ]);
  return true;
};

export const verifyUser = async (name: string, password: string) => {
  console.log("🔥 /auth/verifyUser called");
  const user = await findUserByName(name);
  if (!user) return null;
  const isMatch = await comparePassword(password, user.password);
  await db.query(
    "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
    [user.id]
  );

  return isMatch ? user : null;
};

export const getAllUsers = async () => {
  const [rows]: any = await db.query(
    "SELECT id, name, last_login, role, created_at FROM users"
  );

  return rows.map((row: any) => ({
    ...row,
    last_login: formatToDateTimeICT(row.last_login),
    created_at: formatToDateTimeICT(row.created_at),
  }));
};

export const deleteUserById = async (id: number): Promise<boolean> => {
  const [result]: any = await db.query("DELETE FROM users WHERE id = ?", [id]);
  return result.affectedRows > 0;
};

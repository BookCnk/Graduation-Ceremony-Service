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
  password: string,
  role: string = "user" // ใส่ default เป็น 'user' หากไม่ส่ง role มา
): Promise<boolean> => {
  const [rows]: any = await db.query("SELECT id FROM users WHERE name = ?", [
    name,
  ]);
  if (rows.length > 0) return false;

  const hashed = await hashPassword(password);
  await db.query("INSERT INTO users (name, password, role) VALUES (?, ?, ?)", [
    name,
    hashed,
    role,
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

export const changePassword = async (
  name: string,
  oldPassword: string,
  newPassword: string
): Promise<boolean> => {
  const user = await findUserByName(name);
  if (!user) {
    return false;
  }
  const isMatch = await comparePassword(oldPassword, user.password);
  if (!isMatch) return false;

  const hashedNew = await hashPassword(newPassword);
  const [result]: any = await db.query(
    "UPDATE users SET password = ? WHERE id = ?",
    [hashedNew, user.id]
  );

  return result.affectedRows > 0;
};

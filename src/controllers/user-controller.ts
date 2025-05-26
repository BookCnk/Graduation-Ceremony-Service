import { success, error } from "@/utils/response";
import { getAllUsers, verifyUser, createUser } from "@/services/auth-service";
import type { User } from "@/types/user";
import type { ApiResponse } from "@/types/response";
import { generateToken } from "@/utils/jwt";

export const getAllUsersController = async (): Promise<ApiResponse<User[]>> => {
  const users = await getAllUsers();
  return success(users);
};

export const loginController = async ({
  body,
}: {
  body: { name: string; password: string };
}): Promise<ApiResponse<{ user: Omit<User, "password">; token: string }>> => {
  const { name, password } = body;

  const user = await verifyUser(name, password);
  if (!user) return error("Invalid credentials");

  const token = generateToken({
    id: user.id,
    name: user.name,
  });

  // ✅ ตัด password ออกก่อนส่งกลับ
  const { password: _, ...safeUser } = user;

  return success({ user: safeUser, token }, "Login successful");
};

export const registerController = async ({
  body,
}: any): Promise<ApiResponse<null>> => {
  const { name, password } = body;
  if (!name || !password) return error("Name and password required");
  await createUser(name, password);
  return success(null, "User registered");
};

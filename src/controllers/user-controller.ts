import { success, error } from "@/utils/response";
import {
  getAllUsers,
  verifyUser,
  createUser,
  deleteUserById,
} from "@/services/auth-service";
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
    role: user.role,
  });

  // ✅ ตัด password ออกก่อนส่งกลับ
  const { password: _, ...safeUser } = user;

  return success({ user: safeUser, token }, "Login successful");
};

export const registerController = async ({
  body,
}: {
  body: { name: string; password: string };
}): Promise<ApiResponse<null>> => {
  const { name, password } = body;

  if (!name || !password) return error("Name and password required");

  const created = await createUser(name, password);
  if (!created) return error("User already exists");

  return success(null, "User registered");
};

export const deleteUserController = async ({
  params,
}: {
  params: { id: string };
}): Promise<ApiResponse<null>> => {
  const userId = parseInt(params.id);

  if (isNaN(userId)) {
    return error("Invalid user ID");
  }

  const deleted = await deleteUserById(userId);

  if (!deleted) return error("User not found or already deleted");

  return success(null, "User deleted successfully");
};

import { success, error } from "@/utils/response";
import {
  getAllUsers,
  verifyUser,
  createUser,
  deleteUserById,
  changePassword,
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

  const { password: _, ...safeUser } = user;

  return success({ user: safeUser, token }, "Login successful");
};

export const registerController = async ({
  body,
}: {
  body: { name: string; password: string; role?: string };
}): Promise<ApiResponse<null>> => {
  const { name, password, role = "user" } = body;

  if (!name || !password) return error("Name and password required");

  const created = await createUser(name, password, role);
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

export const changePasswordController = async ({
  body,
}: {
  body: { name: string; oldPassword: string; newPassword: string };
}): Promise<ApiResponse<null>> => {
  const { name, oldPassword, newPassword } = body;

  if (!name || !oldPassword || !newPassword) {
    return error("Please provide name, old password, and new password");
  }

  const changed = await changePassword(name, oldPassword, newPassword);
  if (!changed) return error("Incorrect old password or user not found");

  return success(null, "Password changed successfully");
};

// src/routes/user-route.ts
import { Elysia } from "elysia";
import {
  registerController,
  loginController,
  getAllUsersController,
  deleteUserController, // ✅ เพิ่ม import
} from "@/controllers/user-controller";

export const userRoutes = new Elysia({ prefix: "/auth" })
  .post("/register", registerController)
  .post("/login", loginController)
  .get("/users", getAllUsersController)
  .delete("/users/:id", deleteUserController);

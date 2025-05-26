// src/routes/user-route.ts
import { Elysia } from "elysia";
import {
  loginController,
  registerController,
  getAllUsersController,
} from "@/controllers/user-controller";

export const userRoutes = new Elysia({ prefix: "/auth" }) // <<✅ ต้องมี prefix /auth
  .post("/register", registerController)
  .post("/login", loginController)
  .get("/users", getAllUsersController);